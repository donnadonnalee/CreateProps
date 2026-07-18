// WebP Converter Studio JS Logic

// State management
let state = {
  files: [], // Array of file objects with metadata
  isProcessing: false,
};

// UI Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const selectFolderBtn = document.getElementById('selectFolderBtn');

const qualityInput = document.getElementById('qualityInput');
const qualityVal = document.getElementById('qualityVal');
const filenameTemplate = document.getElementById('filenameTemplate');

const processBtn = document.getElementById('processBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const clearBtn = document.getElementById('clearBtn');

const statsPending = document.getElementById('statsPending');
const statsSuccess = document.getElementById('statsSuccess');
const statsError = document.getElementById('statsError');
const statsTotal = document.getElementById('statsTotal');
const totalSavingsValue = document.getElementById('totalSavingsValue');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');
const searchInput = document.getElementById('searchInput');
const fileListBody = document.getElementById('fileListBody');
const emptyState = document.getElementById('emptyState');

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
});

function initEventListeners() {
  // File upload click handlers
  selectFilesBtn.addEventListener('click', () => fileInput.click());
  selectFolderBtn.addEventListener('click', () => folderInput.click());

  // Input changes
  fileInput.addEventListener('change', handleFileSelect);
  folderInput.addEventListener('change', handleFolderSelect);

  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', handleDrop);

  // Settings changes
  qualityInput.addEventListener('input', () => {
    qualityVal.textContent = qualityInput.value + '%';
  });

  // Action buttons
  processBtn.addEventListener('click', processBatch);
  downloadZipBtn.addEventListener('click', downloadAllAsZip);
  clearBtn.addEventListener('click', clearAll);

  // Search filter
  searchInput.addEventListener('input', renderFileList);
}

// File Parsing Helpers
function handleFileSelect(e) {
  addFiles(Array.from(e.target.files));
  fileInput.value = ''; // Reset
}

function handleFolderSelect(e) {
  addFiles(Array.from(e.target.files));
  folderInput.value = ''; // Reset
}

// Recursive file retrieval for directory drops
async function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const items = e.dataTransfer.items;
  if (!items) return;

  const filePromises = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i].webkitGetAsEntry();
    if (item) {
      filePromises.push(traverseFileTree(item));
    }
  }

  try {
    const fileGroups = await Promise.all(filePromises);
    const allFiles = fileGroups.flat();
    addFiles(allFiles);
  } catch (err) {
    console.error('Error reading dropped files:', err);
  }
}

function traverseFileTree(item, path = '') {
  return new Promise((resolve) => {
    if (item.isFile) {
      item.file((file) => {
        // Filter out non-images
        if (file.type.startsWith('image/')) {
          resolve([file]);
        } else {
          resolve([]);
        }
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      let entries = [];

      const readAllEntries = () => {
        dirReader.readEntries(async (results) => {
          if (results.length) {
            entries = entries.concat(results);
            readAllEntries(); // keep reading until empty
          } else {
            const promises = entries.map(entry => traverseFileTree(entry, path + item.name + '/'));
            const files = await Promise.all(promises);
            resolve(files.flat());
          }
        });
      };
      readAllEntries();
    } else {
      resolve([]);
    }
  });
}

// Add files to state
function addFiles(fileList) {
  const imageFiles = fileList.filter(file => file.type.startsWith('image/'));

  if (imageFiles.length === 0) return;

  imageFiles.forEach(file => {
    // Avoid adding the exact same file object
    if (state.files.some(f => f.file.name === file.name && f.file.size === file.size)) {
      return;
    }

    const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileObj = {
      id: fileId,
      file: file,
      name: file.name,
      status: 'pending',
      outputBlob: null,
      outputName: '',
      thumbnailUrl: '', // Will be filled with Data URL
      errorMsg: ''
    };

    state.files.push(fileObj);

    // Read file as Data URL (Base64) for thumbnail
    const reader = new FileReader();
    reader.onload = (e) => {
      fileObj.thumbnailUrl = e.target.result;
      renderFileList();
    };
    reader.readAsDataURL(file);
  });

  renderFileList();
  updateStats();
  
  // Enable process and clear buttons
  processBtn.disabled = false;
  clearBtn.disabled = false;
}

// Render dynamic list of files
function renderFileList() {
  const searchFilter = searchInput.value.toLowerCase();
  const filtered = state.files.filter(f => f.name.toLowerCase().includes(searchFilter));

  if (state.files.length === 0) {
    emptyState.style.display = 'flex';
    fileListBody.innerHTML = '';
    fileListBody.appendChild(emptyState);
    return;
  }

  emptyState.style.display = 'none';

  // Construct target HTML
  let html = '';
  filtered.forEach((fileObj) => {
    const origSizeText = formatBytes(fileObj.file.size);
    const webpSizeText = fileObj.outputBlob 
      ? formatBytes(fileObj.outputBlob.size) 
      : '待機中';
    
    let savingsText = '-';
    let savingsClass = '';
    if (fileObj.outputBlob) {
      const reduction = ((fileObj.file.size - fileObj.outputBlob.size) / fileObj.file.size) * 100;
      savingsText = `${reduction.toFixed(1)}%`;
      if (reduction > 0) {
        savingsClass = 'savings-gain';
        savingsText = `-${savingsText}`;
      } else {
        savingsText = `+${Math.abs(reduction).toFixed(1)}%`;
      }
    }

    let badgeClass = 'badge-pending';
    let statusText = '待機中';
    let icon = 'clock';

    if (fileObj.status === 'processing') {
      badgeClass = 'badge-processing';
      statusText = '処理中';
      icon = 'loader';
    } else if (fileObj.status === 'success') {
      badgeClass = 'badge-success';
      statusText = '完了';
      icon = 'check-circle';
    } else if (fileObj.status === 'error') {
      badgeClass = 'badge-error';
      statusText = 'エラー';
      icon = 'alert-triangle';
    }

    const downloadDisabled = fileObj.status !== 'success' ? 'disabled' : '';

    html += `
      <div class="list-row" id="row_${fileObj.id}">
        <div class="thumb-cell">
          ${fileObj.thumbnailUrl ? `<img src="${fileObj.thumbnailUrl}" alt="thumbnail">` : '<i data-lucide="image" style="width:20px; height:20px; opacity:0.3"></i>'}
        </div>
        <div class="name-cell">
          <span>${escapeHtml(fileObj.name)}</span>
        </div>
        <div class="size-cell">${origSizeText}</div>
        <div class="webp-size-cell">${webpSizeText}</div>
        <div class="savings-cell ${savingsClass}">${savingsText}</div>
        <div style="display:flex; justify-content: flex-end; gap:8px;">
          <span class="status-badge ${badgeClass}">
            <i data-lucide="${icon}" style="width:12px; height:12px"></i>
            ${statusText}
          </span>
          <button class="btn-icon" onclick="downloadSingle('${fileObj.id}')" ${downloadDisabled} title="個別ダウンロード">
            <i data-lucide="download" style="width:14px; height:14px"></i>
          </button>
        </div>
      </div>
    `;
  });

  fileListBody.innerHTML = html;
  lucide.createIcons();
}

function updateStats() {
  const total = state.files.length;
  const success = state.files.filter(f => f.status === 'success').length;
  const error = state.files.filter(f => f.status === 'error').length;
  const pending = total - success - error;

  statsPending.textContent = pending;
  statsSuccess.textContent = success;
  statsError.textContent = error;
  statsTotal.textContent = total;

  // Calculate total savings
  const successFiles = state.files.filter(f => f.status === 'success' && f.outputBlob);
  if (successFiles.length > 0) {
    const totalOrigBytes = successFiles.reduce((acc, f) => acc + f.file.size, 0);
    const totalWebpBytes = successFiles.reduce((acc, f) => acc + f.outputBlob.size, 0);
    const diff = totalOrigBytes - totalWebpBytes;
    const savingsPercent = totalOrigBytes > 0 ? (diff / totalOrigBytes) * 100 : 0;
    
    totalSavingsValue.textContent = `${savingsPercent > 0 ? '-' : '+'}${Math.abs(savingsPercent).toFixed(1)}% (${formatBytes(totalWebpBytes)} / ${formatBytes(totalOrigBytes)})`;
  } else {
    totalSavingsValue.textContent = `-0% (0 KB / 0 KB)`;
  }

  if (state.isProcessing && total > 0) {
    const percent = Math.round(((success + error) / total) * 100);
    progressBar.style.width = percent + '%';
    progressBarContainer.style.display = 'block';
  } else {
    progressBarContainer.style.display = 'none';
  }

  // ZIP download availability
  downloadZipBtn.disabled = success === 0;
}

// Main Batch Processing Engine
async function processBatch() {
  if (state.files.length === 0 || state.isProcessing) return;

  state.isProcessing = true;
  processBtn.disabled = true;
  clearBtn.disabled = true;
  
  updateStats();

  const quality = parseFloat(qualityInput.value) / 100;
  const template = filenameTemplate.value.trim() || '[name]';

  // Process sequentially to prevent UI freezing
  for (let i = 0; i < state.files.length; i++) {
    const fileObj = state.files[i];
    if (fileObj.status === 'success') continue; // Skip already succeeded

    fileObj.status = 'processing';
    renderFileList();
    updateStats();

    try {
      // Generate output name
      const baseName = fileObj.name.substring(0, fileObj.name.lastIndexOf('.')) || fileObj.name;
      
      let outName = template.replace('[name]', baseName);
      if (outName.includes('[N]')) {
        const numStr = String(i + 1).padStart(2, '0');
        outName = outName.replace('[N]', numStr);
      }
      fileObj.outputName = `${outName}.webp`;

      // Perform conversion to WebP blob
      const resultBlob = await convertToWebP(fileObj.file, quality);
      fileObj.outputBlob = resultBlob;
      fileObj.status = 'success';

    } catch (err) {
      console.error('Error converting file:', fileObj.name, err);
      fileObj.status = 'error';
      fileObj.errorMsg = err.message || '変換に失敗しました。';
    }

    renderFileList();
    updateStats();
  }

  state.isProcessing = false;
  processBtn.disabled = false;
  clearBtn.disabled = false;
  updateStats();
}

// WebP Conversion Logic
function convertToWebP(file, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context could not be created');

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);

        // Convert to WebP Blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob generated null'));
          }
        }, 'image/webp', quality);

      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('画像のロード中にエラーが発生しました。'));
    };

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      img.src = e.target.result;
    };
    fileReader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました。'));
    };
    fileReader.readAsDataURL(file);
  });
}

// Download single file
function downloadSingle(id) {
  const fileObj = state.files.find(f => f.id === id);
  if (!fileObj || !fileObj.outputBlob) return;

  const url = URL.createObjectURL(fileObj.outputBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileObj.outputName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download all files as a single ZIP
async function downloadAllAsZip() {
  const successFiles = state.files.filter(f => f.status === 'success' && f.outputBlob);
  if (successFiles.length === 0) return;

  downloadZipBtn.disabled = true;
  downloadZipBtn.innerHTML = `<i data-lucide="loader" class="spinner" style="width:16px; height:16px;"></i> 圧縮中...`;
  lucide.createIcons();

  try {
    const zip = new JSZip();
    successFiles.forEach((fileObj) => {
      zip.file(fileObj.outputName, fileObj.outputBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'CreateProps_converted_images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Failed to create ZIP:', err);
    alert('ZIPファイルの作成に失敗しました。');
  } finally {
    downloadZipBtn.disabled = false;
    downloadZipBtn.innerHTML = `<i data-lucide="download" style="width:16px; height:16px;"></i> ZIP保存`;
    lucide.createIcons();
  }
}

// Clear all files
function clearAll() {
  if (state.isProcessing) return;

  // Clear files list
  state.files = [];
  state.isProcessing = false;

  renderFileList();
  updateStats();

  processBtn.disabled = true;
  clearBtn.disabled = true;
  downloadZipBtn.disabled = true;
}

// Helper: formats size in bytes to readable format
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper: escaping HTML to prevent XSS
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
