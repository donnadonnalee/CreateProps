// Bulk Resize Studio JS Logic

// State management
let state = {
  files: [], // Array of file objects with metadata
  isProcessing: false,
  processedCount: 0,
  errorCount: 0,
};

// UI Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const selectFolderBtn = document.getElementById('selectFolderBtn');

const presetSelect = document.getElementById('presetSelect');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const lockAspectCheckbox = document.getElementById('lockAspectCheckbox');
const evenDimensionsCheckbox = document.getElementById('evenDimensionsCheckbox');
const evenDimensionsWrapper = document.getElementById('evenDimensionsWrapper');
const resizeModeSelect = document.getElementById('resizeModeSelect');
const marginInput = document.getElementById('marginInput');
const marginVal = document.getElementById('marginVal');
const marginWrapper = document.getElementById('marginWrapper');
const formatSelect = document.getElementById('formatSelect');
const qualityInput = document.getElementById('qualityInput');
const qualityVal = document.getElementById('qualityVal');
const qualityWrapper = document.getElementById('qualityWrapper');
const filenameTemplate = document.getElementById('filenameTemplate');

const processBtn = document.getElementById('processBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const clearBtn = document.getElementById('clearBtn');

const statsPending = document.getElementById('statsPending');
const statsSuccess = document.getElementById('statsSuccess');
const statsError = document.getElementById('statsError');
const statsTotal = document.getElementById('statsTotal');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');
const searchInput = document.getElementById('searchInput');
const fileListBody = document.getElementById('fileListBody');
const emptyState = document.getElementById('emptyState');

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  applyPreset(); // Initial preset setup
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

  // Preset configuration changes
  presetSelect.addEventListener('change', applyPreset);
  formatSelect.addEventListener('change', handleFormatChange);
  qualityInput.addEventListener('input', () => {
    qualityVal.textContent = qualityInput.value + '%';
  });
  marginInput.addEventListener('input', () => {
    marginVal.textContent = marginInput.value + 'px';
  });

  // Aspect ratio lock constraints
  widthInput.addEventListener('input', () => handleDimensionInput('width'));
  heightInput.addEventListener('input', () => handleDimensionInput('height'));

  // Action buttons
  processBtn.addEventListener('click', processBatch);
  downloadZipBtn.addEventListener('click', downloadAllAsZip);
  clearBtn.addEventListener('click', clearAll);

  // Search filter
  searchInput.addEventListener('input', renderFileList);
}

// Preset Handler
function applyPreset() {
  const preset = presetSelect.value;
  
  // Reset fields to editable by default
  widthInput.disabled = false;
  heightInput.disabled = false;
  lockAspectCheckbox.disabled = false;
  evenDimensionsCheckbox.disabled = false;
  marginInput.disabled = false;

  // Show/hide wrappers based on preset requirements
  evenDimensionsWrapper.style.opacity = '1';
  marginWrapper.style.opacity = '1';

  switch (preset) {
    case 'line-sticker':
      widthInput.value = 370;
      heightInput.value = 320;
      lockAspectCheckbox.checked = true;
      evenDimensionsCheckbox.checked = true;
      resizeModeSelect.value = 'contain';
      marginInput.value = 10;
      formatSelect.value = 'png';
      break;

    case 'line-main':
      widthInput.value = 240;
      heightInput.value = 240;
      lockAspectCheckbox.checked = true;
      evenDimensionsCheckbox.checked = true;
      resizeModeSelect.value = 'contain';
      marginInput.value = 10;
      formatSelect.value = 'png';
      break;

    case 'line-tab':
      widthInput.value = 96;
      heightInput.value = 74;
      lockAspectCheckbox.checked = true;
      evenDimensionsCheckbox.checked = true;
      resizeModeSelect.value = 'contain';
      marginInput.value = 10;
      formatSelect.value = 'png';
      break;

    case 'instagram-sq':
      widthInput.value = 1080;
      heightInput.value = 1080;
      lockAspectCheckbox.checked = true;
      resizeModeSelect.value = 'cover';
      marginInput.value = 0;
      break;

    case 'twitter-card':
      widthInput.value = 1200;
      heightInput.value = 675;
      lockAspectCheckbox.checked = true;
      resizeModeSelect.value = 'cover';
      marginInput.value = 0;
      break;

    case 'yt-thumb':
      widthInput.value = 1280;
      heightInput.value = 720;
      lockAspectCheckbox.checked = true;
      resizeModeSelect.value = 'cover';
      marginInput.value = 0;
      break;

    case 'custom':
    default:
      // Leave values as they are
      break;
  }

  // Update value displays
  marginVal.textContent = marginInput.value + 'px';
  handleFormatChange();
}

function handleFormatChange() {
  const format = formatSelect.value;
  if (format === 'jpeg' || format === 'webp') {
    qualityWrapper.style.display = 'flex';
  } else {
    qualityWrapper.style.display = 'none';
  }
}

// Maintain Aspect Ratio on manual size changes
let lastFocusedDimension = 'width';
function handleDimensionInput(changed) {
  lastFocusedDimension = changed;
  if (!lockAspectCheckbox.checked || state.files.length === 0) return;

  // Find the first valid file to get an aspect ratio to lock to
  const referenceFile = state.files.find(f => f.originalSize);
  if (!referenceFile) return;

  const ratio = referenceFile.originalSize.width / referenceFile.originalSize.height;

  if (changed === 'width') {
    const w = parseInt(widthInput.value) || 0;
    heightInput.value = Math.round(w / ratio);
  } else {
    const h = parseInt(heightInput.value) || 0;
    widthInput.value = Math.round(h * ratio);
  }
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
    const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileObj = {
      id: fileId,
      file: file,
      name: file.name,
      originalSize: null,
      targetSize: null,
      status: 'pending',
      outputBlob: null,
      outputName: '',
      thumbnailUrl: '', // Will be filled with Data URL
      errorMsg: ''
    };

    state.files.push(fileObj);

    // Read file as Data URL (Base64) to avoid local blob URL policy restrictions
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      fileObj.thumbnailUrl = dataUrl;

      // Load dimensions
      const img = new Image();
      img.onload = () => {
        fileObj.originalSize = { width: img.width, height: img.height };
        renderFileList();
        updateStats();
      };
      img.onerror = () => {
        fileObj.status = 'error';
        fileObj.errorMsg = '画像の読み込みに失敗しました。';
        renderFileList();
        updateStats();
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      fileObj.status = 'error';
      fileObj.errorMsg = 'ファイルの読み込みに失敗しました。';
      renderFileList();
      updateStats();
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
    const origSizeText = fileObj.originalSize 
      ? `${fileObj.originalSize.width} × ${fileObj.originalSize.height}` 
      : '読み込み中...';
    
    // Calculate preview of output size based on current options
    const targetSizeObj = calculateTargetSize(fileObj.originalSize);
    const targetSizeText = targetSizeObj 
      ? `${targetSizeObj.width} × ${targetSizeObj.height}` 
      : '待機中';

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
          <img src="${fileObj.thumbnailUrl}" alt="thumbnail">
        </div>
        <div class="name-cell">
          <span>${escapeHtml(fileObj.name)}</span>
          <span class="file-meta">${formatBytes(fileObj.file.size)}</span>
        </div>
        <div class="size-cell">${origSizeText}</div>
        <div class="target-cell">${targetSizeText}</div>
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

// Calculate target size based on current options
function calculateTargetSize(originalSize) {
  if (!originalSize) return null;

  let targetW = parseInt(widthInput.value) || 370;
  let targetH = parseInt(heightInput.value) || 320;
  const mode = resizeModeSelect.value;
  const lockAspect = lockAspectCheckbox.checked;
  const enforceEven = evenDimensionsCheckbox.checked;

  if (mode === 'scale' && lockAspect) {
    // Canvas adapts to original aspect ratio inside max bounds
    const ratio = originalSize.width / originalSize.height;
    if (targetW / targetH > ratio) {
      // Width is bottlenecked by Height
      targetW = Math.round(targetH * ratio);
    } else {
      // Height is bottlenecked by Width
      targetH = Math.round(targetW / ratio);
    }
  }

  if (enforceEven) {
    targetW = Math.max(2, Math.round(targetW / 2) * 2);
    targetH = Math.max(2, Math.round(targetH / 2) * 2);
  }

  return { width: targetW, height: targetH };
}

// Main Batch Processing Engine
async function processBatch() {
  if (state.files.length === 0 || state.isProcessing) return;

  state.isProcessing = true;
  processBtn.disabled = true;
  clearBtn.disabled = true;
  presetSelect.disabled = true;
  
  updateStats();

  const targetFormat = formatSelect.value;
  const quality = parseFloat(qualityInput.value) / 100;
  const mode = resizeModeSelect.value;
  const margin = parseInt(marginInput.value) || 0;
  const enforceEven = evenDimensionsCheckbox.checked;
  const template = filenameTemplate.value.trim() || '[name]_resized';

  // Process sequentially to prevent UI freezing
  for (let i = 0; i < state.files.length; i++) {
    const fileObj = state.files[i];
    if (fileObj.status === 'success') continue; // Skip already succeeded

    fileObj.status = 'processing';
    renderFileList();
    updateStats();

    try {
      // Generate output name
      const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      const baseName = fileObj.name.substring(0, fileObj.name.lastIndexOf('.')) || fileObj.name;
      
      let outName = template.replace('[name]', baseName);
      if (outName.includes('[N]')) {
        const numStr = String(i + 1).padStart(2, '0');
        outName = outName.replace('[N]', numStr);
      }
      fileObj.outputName = `${outName}.${ext}`;

      // Perform resize
      const resultBlob = await resizeImage(fileObj.file, targetFormat, quality, mode, margin, enforceEven);
      
      fileObj.outputBlob = resultBlob;
      
      // Convert resultBlob to Data URL for thumbnail preview to avoid local resource policy errors
      const dataUrl = await new Promise((resolveDataUrl, rejectDataUrl) => {
        const reader = new FileReader();
        reader.onload = (e) => resolveDataUrl(e.target.result);
        reader.onerror = () => rejectDataUrl(new Error('プレビューの作成に失敗しました。'));
        reader.readAsDataURL(resultBlob);
      });

      fileObj.thumbnailUrl = dataUrl;
      fileObj.status = 'success';

    } catch (err) {
      console.error('Error processing file:', fileObj.name, err);
      fileObj.status = 'error';
      fileObj.errorMsg = err.message || 'リサイズに失敗しました。';
    }

    renderFileList();
    updateStats();
  }

  state.isProcessing = false;
  processBtn.disabled = false;
  clearBtn.disabled = false;
  presetSelect.disabled = false;
  updateStats();
}

// Resizing Core Logic
function resizeImage(file, format, quality, mode, margin, enforceEven) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context could not be created');

        // 1. Determine base target dimensions (canvas size)
        let canvasW = parseInt(widthInput.value) || 370;
        let canvasH = parseInt(heightInput.value) || 320;

        if (mode === 'scale' && lockAspectCheckbox.checked) {
          const ratio = img.width / img.height;
          if (canvasW / canvasH > ratio) {
            canvasW = Math.round(canvasH * ratio);
          } else {
            canvasH = Math.round(canvasW / ratio);
          }
        }

        // Round canvas dimensions to even if requested
        if (enforceEven) {
          canvasW = Math.max(2, Math.round(canvasW / 2) * 2);
          canvasH = Math.max(2, Math.round(canvasH / 2) * 2);
        }

        canvas.width = canvasW;
        canvas.height = canvasH;

        // 2. Clear canvas and fill JPEG with white background
        ctx.clearRect(0, 0, canvasW, canvasH);
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // 3. Compute drawing bounds inside the canvas (respecting margin)
        const innerMaxW = Math.max(1, canvasW - 2 * margin);
        const innerMaxH = Math.max(1, canvasH - 2 * margin);

        let drawW = innerMaxW;
        let drawH = innerMaxH;
        let drawX = margin;
        let drawY = margin;

        const imgRatio = img.width / img.height;
        const innerRatio = innerMaxW / innerMaxH;

        if (mode === 'contain' || mode === 'scale') {
          // Fit image completely inside inner bounds (maintain aspect ratio)
          if (imgRatio > innerRatio) {
            // Bottlenecked by width
            drawW = innerMaxW;
            drawH = Math.round(innerMaxW / imgRatio);
          } else {
            // Bottlenecked by height
            drawH = innerMaxH;
            drawW = Math.round(innerMaxH * imgRatio);
          }
          // Center the drawing inside the target area
          drawX = margin + Math.floor((innerMaxW - drawW) / 2);
          drawY = margin + Math.floor((innerMaxH - drawH) / 2);

        } else if (mode === 'cover') {
          // Crop image to completely fill inner bounds
          if (imgRatio > innerRatio) {
            // Image is wider than crop box
            drawH = innerMaxH;
            drawW = Math.round(innerMaxH * imgRatio);
          } else {
            // Image is taller than crop box
            drawW = innerMaxW;
            drawH = Math.round(innerMaxW / imgRatio);
          }
          // Center the crop
          drawX = margin + Math.floor((innerMaxW - drawW) / 2);
          drawY = margin + Math.floor((innerMaxH - drawH) / 2);

        } else if (mode === 'stretch') {
          // Stretch image exactly to inner bounds
          drawW = innerMaxW;
          drawH = innerMaxH;
          drawX = margin;
          drawY = margin;
        }

        // Draw the image
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        // Convert to Blob
        let mimeType = 'image/png';
        if (format === 'jpeg') mimeType = 'image/jpeg';
        if (format === 'webp') mimeType = 'image/webp';

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob generated null'));
          }
        }, mimeType, format === 'png' ? undefined : quality);

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
    a.download = 'CreateProps_resized_images.zip';
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
  state.processedCount = 0;
  state.errorCount = 0;
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
