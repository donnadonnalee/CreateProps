// Typography Studio Editor Logic

// State management
let state = {
  layers: [],
  selectedLayerId: null,
  userZoomScale: 'fit', // 'fit' | number (e.g. 1.0, 0.75)
  canvasSettings: {
    width: 800,
    height: 800,
    bgType: 'transparent', // 'transparent' | 'solid' | 'image'
    bgColor: '#0c0d12',
    bgImageFit: 'cover'
  },
  drag: {
    isDragging: false,
    startX: 0,
    startY: 0
  }
};

let bgImageObject = null; // Stores loaded HTMLImageElement for background

// DOM Elements
const canvas = document.getElementById('textCanvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer');
const canvasViewport = document.getElementById('canvasViewport');

const mainEditor = document.querySelector('.main-editor');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const toggleSidebarIcon = document.getElementById('toggleSidebarIcon');
const toggleSidebarText = document.getElementById('toggleSidebarText');

const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomLevelText = document.getElementById('zoomLevelText');
const zoomFitBtn = document.getElementById('zoomFitBtn');
const zoom100Btn = document.getElementById('zoom100Btn');

const canvasSizeSelect = document.getElementById('canvasSizeSelect');
const customCanvasSizeRow = document.getElementById('customCanvasSizeRow');
const canvasWidthInput = document.getElementById('canvasWidthInput');
const canvasHeightInput = document.getElementById('canvasHeightInput');
const bgTypeSelect = document.getElementById('bgTypeSelect');
const canvasBgColorWrapper = document.getElementById('canvasBgColorWrapper');
const canvasBgColorInput = document.getElementById('canvasBgColorInput');
const canvasBgColorText = document.getElementById('canvasBgColorText');
const canvasBgImageWrapper = document.getElementById('canvasBgImageWrapper');
const canvasBgImageInput = document.getElementById('canvasBgImageInput');
const canvasBgImageFitSelect = document.getElementById('canvasBgImageFitSelect');

const layersList = document.getElementById('layersList');
const addTextBtn = document.getElementById('addTextBtn');

const inspectorPanel = document.getElementById('inspectorPanel');
const inspectorContent = document.getElementById('inspectorContent');
const inspectorPlaceholder = document.getElementById('inspectorPlaceholder');

const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const customFontWrapper = document.getElementById('customFontWrapper');
const customFontInput = document.getElementById('customFontInput');
const fontLoadIndicator = document.getElementById('fontLoadIndicator');

const fontSizeInput = document.getElementById('fontSizeInput');
const fontSizeVal = document.getElementById('fontSizeVal');
const letterSpacingInput = document.getElementById('letterSpacingInput');
const letterSpacingVal = document.getElementById('letterSpacingVal');
const boldToggle = document.getElementById('boldToggle');
const italicToggle = document.getElementById('italicToggle');

const colorTypeSelect = document.getElementById('colorTypeSelect');
const solidColorWrapper = document.getElementById('solidColorWrapper');
const solidColorInput = document.getElementById('solidColorInput');
const solidColorText = document.getElementById('solidColorText');

const gradientColorWrapper = document.getElementById('gradientColorWrapper');
const gradientStartInput = document.getElementById('gradientStartInput');
const gradientStartText = document.getElementById('gradientStartText');
const gradientEndInput = document.getElementById('gradientEndInput');
const gradientEndText = document.getElementById('gradientEndText');
const gradientAngleInput = document.getElementById('gradientAngleInput');
const gradientAngleVal = document.getElementById('gradientAngleVal');

const patternColorWrapper = document.getElementById('patternColorWrapper');
const patternImageInput = document.getElementById('patternImageInput');
const patternScaleInput = document.getElementById('patternScaleInput');
const patternScaleVal = document.getElementById('patternScaleVal');

const rotateInput = document.getElementById('rotateInput');
const rotateVal = document.getElementById('rotateVal');
const skewXInput = document.getElementById('skewXInput');
const skewXVal = document.getElementById('skewXVal');
const curveInput = document.getElementById('curveInput');
const curveVal = document.getElementById('curveVal');

const scaleXInput = document.getElementById('scaleXInput');
const scaleXVal = document.getElementById('scaleXVal');
const scaleYInput = document.getElementById('scaleYInput');
const scaleYVal = document.getElementById('scaleYVal');

const strokeEnabled = document.getElementById('strokeEnabled');
const strokeSettingsWrapper = document.getElementById('strokeSettingsWrapper');
const strokeColorInput = document.getElementById('strokeColorInput');
const strokeColorText = document.getElementById('strokeColorText');
const strokeWidthInput = document.getElementById('strokeWidthInput');
const strokeWidthVal = document.getElementById('strokeWidthVal');

const shadowEnabled = document.getElementById('shadowEnabled');
const shadowSettingsWrapper = document.getElementById('shadowSettingsWrapper');
const shadowColorInput = document.getElementById('shadowColorInput');
const shadowColorText = document.getElementById('shadowColorText');
const shadowBlurInput = document.getElementById('shadowBlurInput');
const shadowBlurVal = document.getElementById('shadowBlurVal');
const shadowXInput = document.getElementById('shadowXInput');
const shadowYInput = document.getElementById('shadowYInput');

const layerBgEnabled = document.getElementById('layerBgEnabled');
const layerBgSettingsWrapper = document.getElementById('layerBgSettingsWrapper');
const layerBgColorInput = document.getElementById('layerBgColorInput');
const layerBgColorText = document.getElementById('layerBgColorText');
const layerBgOpacityInput = document.getElementById('layerBgOpacityInput');
const layerBgOpacityVal = document.getElementById('layerBgOpacityVal');
const layerBgImageInput = document.getElementById('layerBgImageInput');
const layerBgFitSelect = document.getElementById('layerBgFitSelect');
const layerBgPaddingInput = document.getElementById('layerBgPaddingInput');
const layerBgRadiusInput = document.getElementById('layerBgRadiusInput');

const moveFrontBtn = document.getElementById('moveFrontBtn');
const moveBackBtn = document.getElementById('moveBackBtn');
const duplicateBtn = document.getElementById('duplicateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const exportBtn = document.getElementById('exportBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupCanvasSize();
  initEventListeners();
  addDefaultLayer();
  draw();
});

// Setup Initial Canvas Size
function setupCanvasSize() {
  const preset = canvasSizeSelect.value;
  let w = 800, h = 800;

  if (preset === 'square') {
    w = 800; h = 800;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'line-stamp') {
    w = 370; h = 320;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'line-main') {
    w = 240; h = 240;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'twitter-header') {
    w = 1500; h = 500;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'gplay-icon') {
    w = 512; h = 512;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'gplay-feature') {
    w = 1024; h = 500;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'gplay-phone') {
    w = 1080; h = 2340;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'gplay-tablet') {
    w = 1920; h = 1080;
    customCanvasSizeRow.style.display = 'none';
  } else if (preset === 'custom') {
    w = parseInt(canvasWidthInput.value) || 800;
    h = parseInt(canvasHeightInput.value) || 800;
    customCanvasSizeRow.style.display = 'flex';
  }

  state.canvasSettings.width = w;
  state.canvasSettings.height = h;

  canvas.width = w;
  canvas.height = h;

  applyCanvasDisplayScale();
}

function getFitScale() {
  const w = state.canvasSettings.width;
  const h = state.canvasSettings.height;
  const viewportW = Math.max(300, (canvasViewport ? canvasViewport.clientWidth : window.innerWidth) - 60);
  const viewportH = Math.max(300, (canvasViewport ? canvasViewport.clientHeight : window.innerHeight) - 60);
  const rawScale = Math.min(viewportW / w, viewportH / h);
  return Math.min(1.0, Math.max(0.35, rawScale));
}

function setZoomLevel(scale) {
  state.userZoomScale = scale;
  applyCanvasDisplayScale();
}

function applyCanvasDisplayScale() {
  const w = state.canvasSettings.width;
  const h = state.canvasSettings.height;

  let computedScale = 1.0;
  if (state.userZoomScale === 'fit') {
    computedScale = getFitScale();
    zoomLevelText.textContent = Math.round(computedScale * 100) + '% (Fit)';
  } else {
    computedScale = typeof state.userZoomScale === 'number' ? state.userZoomScale : 1.0;
    zoomLevelText.textContent = Math.round(computedScale * 100) + '%';
  }

  canvas.style.width = Math.round(w * computedScale) + 'px';
  canvas.style.height = Math.round(h * computedScale) + 'px';
}

// Add a default layer on load
function addDefaultLayer() {
  const layer = createTextLayer('CreateProps', state.canvasSettings.width / 2, state.canvasSettings.height / 2);
  layer.fontFamily = 'Zen Kaku Gothic New';
  layer.fontSize = 80;
  state.layers.push(layer);
  selectLayer(layer.id);
  loadGoogleFont(layer.fontFamily); // Download font dynamically
}

function createTextLayer(text = 'TEXT', x = 400, y = 400) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    text: text,
    x: x,
    y: y,
    fontFamily: 'Zen Kaku Gothic New',
    fontSize: 60,
    bold: false,
    italic: false,
    letterSpacing: 0,
    colorType: 'solid', // 'solid' | 'gradient' | 'pattern'
    fillSolid: '#f43f5e',
    fillGradStart: '#f43f5e',
    fillGradEnd: '#fb923c',
    fillGradAngle: 90,
    patternImageObj: null,
    patternImageFile: null,
    patternScale: 1.0,
    strokeEnabled: false,
    strokeColor: '#000000',
    strokeWidth: 4,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 8,
    shadowX: 4,
    shadowY: 4,
    layerBgEnabled: false,
    layerBgColor: '#1e1e24',
    layerBgOpacity: 1.0,
    layerBgImageObj: null,
    layerBgImageFile: null,
    layerBgFit: 'cover', // 'cover' | 'contain' | 'stretch' | 'tile'
    layerBgPadding: 16,
    layerBgRadius: 8,
    rotation: 0,
    skewX: 0,
    curveAngle: 0,
    scaleX: 1.0,
    scaleY: 1.0,
    // Calculated dynamically during draw
    width: 100,
    height: 60
  };
}

// Select layer and populate inspector
function selectLayer(id) {
  state.selectedLayerId = id;
  renderLayersList();

  if (id === null) {
    inspectorContent.style.display = 'none';
    inspectorPlaceholder.style.display = 'block';

    moveFrontBtn.disabled = true;
    moveBackBtn.disabled = true;
    duplicateBtn.disabled = true;
    deleteBtn.disabled = true;
    return;
  }

  inspectorContent.style.display = 'block';
  inspectorPlaceholder.style.display = 'none';

  moveFrontBtn.disabled = false;
  moveBackBtn.disabled = false;
  duplicateBtn.disabled = false;
  deleteBtn.disabled = false;

  const layer = state.layers.find(l => l.id === id);
  if (!layer) return;

  // Populate UI
  textInput.value = layer.text;
  
  if (['Zen Kaku Gothic New', 'Noto Sans JP', 'Noto Serif JP', 'Shippori Mincho', 'Kaisei Tokumin', 'M PLUS Rounded 1c', 'Dela Gothic One', 'Yusei Magic (Brush)', 'Hachi Maru Pop', 'Montserrat', 'Playfair Display', 'Pacifico', 'Bungee', 'Poppins', 'Anton', 'Lobster', 'Special Elite'].includes(layer.fontFamily)) {
    fontSelect.value = layer.fontFamily;
    customFontWrapper.style.display = 'none';
  } else {
    fontSelect.value = 'custom-font';
    customFontWrapper.style.display = 'block';
    customFontInput.value = layer.fontFamily;
  }

  fontSizeInput.value = layer.fontSize;
  fontSizeVal.textContent = layer.fontSize + 'px';

  letterSpacingInput.value = layer.letterSpacing;
  letterSpacingVal.textContent = layer.letterSpacing + 'px';

  scaleXInput.value = layer.scaleX !== undefined ? layer.scaleX : 1.0;
  scaleXVal.textContent = (layer.scaleX !== undefined ? layer.scaleX.toFixed(2) : '1.00') + 'x';
  scaleYInput.value = layer.scaleY !== undefined ? layer.scaleY : 1.0;
  scaleYVal.textContent = (layer.scaleY !== undefined ? layer.scaleY.toFixed(2) : '1.00') + 'x';

  boldToggle.classList.toggle('active', layer.bold);
  italicToggle.classList.toggle('active', layer.italic);

  colorTypeSelect.value = layer.colorType;
  if (layer.colorType === 'solid') {
    solidColorWrapper.style.display = 'block';
    gradientColorWrapper.style.display = 'none';
    patternColorWrapper.style.display = 'none';
    solidColorInput.value = layer.fillSolid;
    solidColorText.value = layer.fillSolid;
  } else if (layer.colorType === 'gradient') {
    solidColorWrapper.style.display = 'none';
    gradientColorWrapper.style.display = 'block';
    patternColorWrapper.style.display = 'none';
    gradientStartInput.value = layer.fillGradStart;
    gradientStartText.value = layer.fillGradStart;
    gradientEndInput.value = layer.fillGradEnd;
    gradientEndText.value = layer.fillGradEnd;
    gradientAngleInput.value = layer.fillGradAngle;
    gradientAngleVal.textContent = layer.fillGradAngle + '°';
  } else if (layer.colorType === 'pattern') {
    solidColorWrapper.style.display = 'none';
    gradientColorWrapper.style.display = 'none';
    patternColorWrapper.style.display = 'block';
    patternScaleInput.value = layer.patternScale || 1.0;
    patternScaleVal.textContent = (layer.patternScale || 1.0).toFixed(1) + 'x';
  }

  rotateInput.value = layer.rotation;
  rotateVal.textContent = layer.rotation + '°';

  skewXInput.value = layer.skewX;
  skewXVal.textContent = layer.skewX + '°';

  curveInput.value = layer.curveAngle;
  curveVal.textContent = layer.curveAngle + '°';

  strokeEnabled.checked = layer.strokeEnabled;
  strokeSettingsWrapper.style.display = layer.strokeEnabled ? 'block' : 'none';
  strokeColorInput.value = layer.strokeColor;
  strokeColorText.value = layer.strokeColor;
  strokeWidthInput.value = layer.strokeWidth;
  strokeWidthVal.textContent = layer.strokeWidth + 'px';

  shadowEnabled.checked = layer.shadowEnabled;
  shadowSettingsWrapper.style.display = layer.shadowEnabled ? 'block' : 'none';
  shadowColorInput.value = layer.shadowColor;
  shadowColorText.value = layer.shadowColor;
  shadowBlurInput.value = layer.shadowBlur;
  shadowBlurVal.textContent = layer.shadowBlur + 'px';
  shadowXInput.value = layer.shadowX;
  shadowYInput.value = layer.shadowY;

  // Layer Background settings
  layerBgEnabled.checked = !!layer.layerBgEnabled;
  layerBgSettingsWrapper.style.display = layer.layerBgEnabled ? 'block' : 'none';
  layerBgColorInput.value = layer.layerBgColor || '#1e1e24';
  layerBgColorText.value = layer.layerBgColor || '#1e1e24';
  layerBgOpacityInput.value = layer.layerBgOpacity !== undefined ? layer.layerBgOpacity : 1.0;
  layerBgOpacityVal.textContent = (layer.layerBgOpacity !== undefined ? layer.layerBgOpacity : 1.0).toFixed(2);
  layerBgFitSelect.value = layer.layerBgFit || 'cover';
  layerBgPaddingInput.value = layer.layerBgPadding !== undefined ? layer.layerBgPadding : 16;
  layerBgRadiusInput.value = layer.layerBgRadius !== undefined ? layer.layerBgRadius : 8;

  // Check font load status
  checkFontLoaded(layer.fontFamily);
}

function checkFontLoaded(fontFamily) {
  fontLoadIndicator.style.display = 'none';
  document.fonts.ready.then(() => {
    if (document.fonts.check(`1em "${fontFamily}"`)) {
      fontLoadIndicator.style.display = 'inline-flex';
    }
  });
}

// Dynamic Font Downloader
function loadGoogleFont(fontName) {
  if (!fontName || ['sans-serif', 'serif', 'monospace'].includes(fontName)) {
    return Promise.resolve();
  }

  const fontKey = fontName.replace(/\s+/g, '+');
  const styleId = `gfont_${fontName.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (document.getElementById(styleId)) {
    return document.fonts.load(`1em "${fontName}"`);
  }

  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.id = styleId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontKey}:wght@400;700&display=swap`;
    link.onload = () => {
      document.fonts.load(`1em "${fontName}"`)
        .then(() => {
          checkFontLoaded(fontName);
          draw();
          resolve();
        })
        .catch(() => {
          draw();
          resolve();
        });
    };
    link.onerror = () => {
      resolve();
    };
    document.head.appendChild(link);
  });
}

// Render layer rows in Layers panel
function renderLayersList() {
  layersList.innerHTML = '';
  // Reverse loop so top layer is listed at the top of the UI
  for (let i = state.layers.length - 1; i >= 0; i--) {
    const layer = state.layers[i];
    const row = document.createElement('div');
    row.className = `layer-item ${layer.id === state.selectedLayerId ? 'active' : ''}`;
    row.onclick = () => selectLayer(layer.id);

    row.innerHTML = `
      <div class="layer-title-wrapper">
        <i data-lucide="type" style="width: 14px; height: 14px; opacity:0.6;"></i>
        <span style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(layer.text)}</span>
      </div>
      <div class="layer-actions" onclick="event.stopPropagation()">
        <button class="layer-btn" onclick="duplicateLayerById('${layer.id}')" title="複製">
          <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
        </button>
        <button class="layer-btn" onclick="orderLayer('${layer.id}', 'up')" title="最前面へ移動">
          <i data-lucide="arrow-up" style="width: 14px; height: 14px;"></i>
        </button>
        <button class="layer-btn" onclick="orderLayer('${layer.id}', 'down')" title="最背面へ移動">
          <i data-lucide="arrow-down" style="width: 14px; height: 14px;"></i>
        </button>
        <button class="layer-btn delete" onclick="deleteLayerById('${layer.id}')" title="削除">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
    `;
    layersList.appendChild(row);
  }
  lucide.createIcons();
}

function duplicateLayerById(id) {
  const current = state.layers.find(l => l.id === id);
  if (!current) return;

  const copy = { ...current };
  copy.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  copy.x += 20;
  copy.y += 20;

  state.layers.push(copy);
  selectLayer(copy.id);
  draw();
}

// Add/Delete/Order layers
function addTextLayer() {
  // Center on screen
  const w = state.canvasSettings.width;
  const h = state.canvasSettings.height;
  const layer = createTextLayer('TEXT', w / 2, h / 2);
  state.layers.push(layer);
  selectLayer(layer.id);
  loadGoogleFont(layer.fontFamily); // Download font dynamically
  draw();
}

function deleteLayerById(id) {
  state.layers = state.layers.filter(l => l.id !== id);
  if (state.selectedLayerId === id) {
    selectLayer(state.layers.length > 0 ? state.layers[state.layers.length - 1].id : null);
  } else {
    renderLayersList();
  }
  draw();
}

function orderLayer(id, direction) {
  const index = state.layers.findIndex(l => l.id === id);
  if (index === -1) return;

  if (direction === 'up' && index < state.layers.length - 1) {
    // Swap with next index (moves forward in rendering stack)
    const temp = state.layers[index];
    state.layers[index] = state.layers[index + 1];
    state.layers[index + 1] = temp;
  } else if (direction === 'down' && index > 0) {
    // Swap with previous index (moves backward in rendering stack)
    const temp = state.layers[index];
    state.layers[index] = state.layers[index - 1];
    state.layers[index - 1] = temp;
  }
  renderLayersList();
  draw();
}

// Bounding box hit test (rotates pointer into local text coordinates)
function hitTestLayer(layer, mx, my) {
  const dx = mx - layer.x;
  const dy = my - layer.y;
  
  // Rotate pointer counter to layer's rotation angle to match unrotated bounding box
  const rad = -layer.rotation * Math.PI / 180;
  const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

  const sX = layer.scaleX || 1.0;
  const sY = layer.scaleY || 1.0;
  const localScaledX = localX / sX;
  const localScaledY = localY / sY;

  const halfW = layer.width / 2;
  const halfH = layer.height / 2;

  // Add 15px extra hit zone padding for thin/small text sizes
  return (localScaledX >= -halfW - 15 && localScaledX <= halfW + 15 &&
          localScaledY >= -halfH - 15 && localScaledY <= halfH + 15);
}

// Canvas Drawing Engine
function draw() {
  const w = state.canvasSettings.width;
  const h = state.canvasSettings.height;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Background Solid Color
  if (state.canvasSettings.bgType === 'solid') {
    ctx.fillStyle = state.canvasSettings.bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  // Background Image
  if (state.canvasSettings.bgType === 'image' && bgImageObject) {
    const fit = state.canvasSettings.bgImageFit;
    const iW = bgImageObject.width;
    const iH = bgImageObject.height;

    if (fit === 'stretch') {
      ctx.drawImage(bgImageObject, 0, 0, w, h);
    } else if (fit === 'original') {
      const x = (w - iW) / 2;
      const y = (h - iH) / 2;
      ctx.drawImage(bgImageObject, x, y, iW, iH);
    } else if (fit === 'contain') {
      const ratio = iW / iH;
      let drawW = w;
      let drawH = h;
      if (w / h > ratio) {
        drawW = h * ratio;
      } else {
        drawH = w / ratio;
      }
      const drawX = (w - drawW) / 2;
      const drawY = (h - drawH) / 2;
      ctx.drawImage(bgImageObject, drawX, drawY, drawW, drawH);
    } else { // 'cover'
      const ratio = iW / iH;
      let drawW = w;
      let drawH = h;
      if (w / h > ratio) {
        drawH = w / ratio;
      } else {
        drawW = h * ratio;
      }
      const drawX = (w - drawW) / 2;
      const drawY = (h - drawH) / 2;
      ctx.drawImage(bgImageObject, drawX, drawY, drawW, drawH);
    }
  }

  // Draw Layers (bottom to top)
  state.layers.forEach((layer) => {
    ctx.save();

    // 1. Position & Rotations
    ctx.translate(layer.x, layer.y);
    ctx.rotate(layer.rotation * Math.PI / 180);
    ctx.transform(1, 0, Math.tan(layer.skewX * Math.PI / 180), 1, 0, 0);
    ctx.scale(layer.scaleX || 1.0, layer.scaleY || 1.0);

    // 2. Set Font
    ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px "${layer.fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. Set Color Fill (Solid / Gradient)
    let fillStyle = layer.fillSolid;
    
    // Measure uncurved width/height for layout bounding box calculation
    const textMetrics = ctx.measureText(layer.text);
    const textWidth = textMetrics.width;
    const textHeight = layer.fontSize * 1.1; // Estimate
    
    layer.width = textWidth;
    layer.height = textHeight;

    // Draw Layer Background Box (if enabled)
    if (layer.layerBgEnabled) {
      ctx.save();
      const pad = layer.layerBgPadding !== undefined ? layer.layerBgPadding : 16;
      const rad = layer.layerBgRadius !== undefined ? layer.layerBgRadius : 8;
      const bgW = textWidth + pad * 2;
      const bgH = textHeight + pad * 2;
      const bgX = -bgW / 2;
      const bgY = -bgH / 2;

      ctx.globalAlpha = layer.layerBgOpacity !== undefined ? layer.layerBgOpacity : 1.0;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bgX, bgY, bgW, bgH, rad);
      } else {
        ctx.rect(bgX, bgY, bgW, bgH);
      }

      if (layer.layerBgColor) {
        ctx.fillStyle = layer.layerBgColor;
        ctx.fill();
      }

      if (layer.layerBgImageObj) {
        ctx.clip();
        const img = layer.layerBgImageObj;
        const iW = img.width;
        const iH = img.height;
        const fit = layer.layerBgFit || 'cover';

        if (fit === 'tile') {
          const pat = ctx.createPattern(img, 'repeat');
          ctx.fillStyle = pat;
          ctx.fillRect(bgX, bgY, bgW, bgH);
        } else if (fit === 'stretch') {
          ctx.drawImage(img, bgX, bgY, bgW, bgH);
        } else if (fit === 'contain') {
          const ratio = iW / iH;
          let drawW = bgW, drawH = bgH;
          if (bgW / bgH > ratio) { drawW = bgH * ratio; } else { drawH = bgW / ratio; }
          ctx.drawImage(img, bgX + (bgW - drawW) / 2, bgY + (bgH - drawH) / 2, drawW, drawH);
        } else { // 'cover'
          const ratio = iW / iH;
          let drawW = bgW, drawH = bgH;
          if (bgW / bgH > ratio) { drawH = bgW / ratio; } else { drawW = h * ratio; drawW = bgH * ratio; }
          ctx.drawImage(img, bgX + (bgW - drawW) / 2, bgY + (bgH - drawH) / 2, drawW, drawH);
        }
      }
      ctx.restore();
    }

    if (layer.colorType === 'gradient') {
      const angleRad = layer.fillGradAngle * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const halfW = textWidth / 2;
      const halfH = textHeight / 2;

      // Span gradient across the bounding box area
      const x1 = -halfW * cos;
      const y1 = -halfH * sin;
      const x2 = halfW * cos;
      const y2 = halfH * sin;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, layer.fillGradStart);
      grad.addColorStop(1, layer.fillGradEnd);
      fillStyle = grad;
    } else if (layer.colorType === 'pattern' && layer.patternImageObj) {
      const scale = layer.patternScale || 1.0;
      if (Math.abs(scale - 1.0) > 0.01) {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = Math.max(1, Math.round(layer.patternImageObj.width * scale));
        pCanvas.height = Math.max(1, Math.round(layer.patternImageObj.height * scale));
        const pCtx = pCanvas.getContext('2d');
        pCtx.drawImage(layer.patternImageObj, 0, 0, pCanvas.width, pCanvas.height);
        fillStyle = ctx.createPattern(pCanvas, 'repeat');
      } else {
        fillStyle = ctx.createPattern(layer.patternImageObj, 'repeat');
      }
    }

    ctx.fillStyle = fillStyle;

    // 4. Setup Shadow (Applied globally for text nodes)
    if (layer.shadowEnabled) {
      ctx.shadowColor = layer.shadowColor;
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowOffsetX = layer.shadowX;
      ctx.shadowOffsetY = layer.shadowY;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // 5. Setup Stroke/Border
    if (layer.strokeEnabled) {
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
    }

    // 6. Draw Text (Straight or Curved)
    if (Math.abs(layer.curveAngle) < 1) {
      // Draw straight
      // Handle letter-spacing if not 0 (drawn manually char by char)
      if (layer.letterSpacing !== 0) {
        drawSpacedText(layer.text, 0, 0, layer.letterSpacing, layer.strokeEnabled);
      } else {
        if (layer.strokeEnabled) {
          ctx.strokeText(layer.text, 0, 0);
        }
        ctx.fillText(layer.text, 0, 0);
      }
    } else {
      // Curved along circle arc
      drawCurvedText(layer, fillStyle);
    }

    // 7. Draw Dotted Bounding Box around Selected Layer
    if (layer.id === state.selectedLayerId) {
      ctx.restore(); // Clear shadow/stroke/gradients to draw helper box
      ctx.save();
      
      // Re-apply positioning transforms only
      ctx.translate(layer.x, layer.y);
      ctx.rotate(layer.rotation * Math.PI / 180);
      ctx.transform(1, 0, Math.tan(layer.skewX * Math.PI / 180), 1, 0, 0);
      ctx.scale(layer.scaleX || 1.0, layer.scaleY || 1.0);

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5 / Math.max(layer.scaleX || 1.0, layer.scaleY || 1.0);
      ctx.setLineDash([4 / Math.max(layer.scaleX || 1.0, layer.scaleY || 1.0), 4 / Math.max(layer.scaleX || 1.0, layer.scaleY || 1.0)]);
      
      // Draw selection rect box
      const boxW = layer.width + 24;
      const boxH = layer.height + 16;
      ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
      
      // Draw active center pivot node
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 4 / Math.max(layer.scaleX || 1.0, layer.scaleY || 1.0), 0, Math.PI * 2);
      ctx.fill();

      ctx.setLineDash([]);
    }

    ctx.restore();
  });
}

// Letter Spacing Drawing Helper
function drawSpacedText(text, x, y, spacing, drawStroke) {
  const chars = Array.from(text);
  let totalW = 0;
  const charWidths = chars.map(char => {
    const w = ctx.measureText(char).width;
    totalW += w;
    return w;
  });

  // Include letter spacing in total width calculation
  const spacedTotalW = totalW + (chars.length - 1) * spacing;
  let startX = x - spacedTotalW / 2;

  chars.forEach((char, idx) => {
    const charW = charWidths[idx];
    const charX = startX + charW / 2;
    if (drawStroke) {
      ctx.strokeText(char, charX, y);
    }
    ctx.fillText(char, charX, y);
    startX += charW + spacing;
  });
}

// Curved Text Drawing Helper
function drawCurvedText(layer, fillStyle) {
  const text = layer.text;
  const curveAngleDeg = layer.curveAngle;
  const spacing = layer.letterSpacing;
  
  const chars = Array.from(text);
  if (chars.length === 0) return;

  // Measure character widths
  let totalTextW = 0;
  const charWidths = chars.map(char => {
    const w = ctx.measureText(char).width;
    totalTextW += w;
    return w;
  });

  // Calculate spaced width
  const totalSpacedW = totalTextW + (chars.length - 1) * spacing;
  layer.width = totalSpacedW; // Update approximate boundary width

  // Determine radius (r) from arc length (totalSpacedW) and bend angle (theta)
  const theta = Math.abs(curveAngleDeg) * Math.PI / 180;
  const r = totalSpacedW / theta;

  // Align circle center
  // If curveAngle is positive: arch upward (center is below the text)
  // If curveAngle is negative: smile/trough downward (center is above the text)
  const isArch = curveAngleDeg > 0;
  const centerY = isArch ? r : -r;

  // Draw characters along the circumference
  let cumulativeW = 0;
  chars.forEach((char, idx) => {
    const charW = charWidths[idx];
    
    // Position on horizontal arc relative to center
    const centerOffset = cumulativeW + charW / 2 - totalSpacedW / 2;
    const charAngle = (centerOffset / totalSpacedW) * theta;

    ctx.save();
    
    // Translate coordinate matrix to circle center
    ctx.translate(0, centerY);
    // Rotate character location along the circumference
    ctx.rotate(isArch ? charAngle : -charAngle);
    // Translate back to the radial circumference edge
    ctx.translate(0, isArch ? -r : r);

    // Render character centered at (0, 0)
    if (layer.strokeEnabled) {
      ctx.strokeText(char, 0, 0);
    }
    ctx.fillText(char, 0, 0);

    ctx.restore();
    
    cumulativeW += charW + spacing;
  });
}

// Interactive events for text dragging
function initEventListeners() {
  // Canvas Mouse Interactions
  canvas.addEventListener('mousedown', handlePointerDown);
  canvas.addEventListener('mousemove', handlePointerMove);
  canvas.addEventListener('mouseup', handlePointerUp);
  canvas.addEventListener('mouseleave', handlePointerUp);

  // Touch Interactions (Mobile support)
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handlePointerDown(touch);
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handlePointerMove(touch);
    }
  }, { passive: true });

  canvas.addEventListener('touchend', handlePointerUp);

  // Inspector Input Event Listeners
  textInput.addEventListener('input', () => {
    updateActiveLayer('text', textInput.value);
    renderLayersList();
  });

  fontSelect.addEventListener('change', () => {
    const val = fontSelect.value;
    if (val === 'custom-font') {
      customFontWrapper.style.display = 'block';
      const customName = customFontInput.value.trim();
      if (customName) {
        updateActiveLayer('fontFamily', customName);
        loadGoogleFont(customName);
      }
    } else {
      customFontWrapper.style.display = 'none';
      updateActiveLayer('fontFamily', val);
      loadGoogleFont(val);
    }
  });

  customFontInput.addEventListener('input', () => {
    const customName = customFontInput.value.trim();
    if (customName) {
      updateActiveLayer('fontFamily', customName);
      loadGoogleFont(customName);
    }
  });

  // Slider change listeners
  fontSizeInput.addEventListener('input', () => {
    const size = parseInt(fontSizeInput.value);
    fontSizeVal.textContent = size + 'px';
    updateActiveLayer('fontSize', size);
  });

  letterSpacingInput.addEventListener('input', () => {
    const sp = parseInt(letterSpacingInput.value);
    letterSpacingVal.textContent = sp + 'px';
    updateActiveLayer('letterSpacing', sp);
  });

  scaleXInput.addEventListener('input', () => {
    const val = parseFloat(scaleXInput.value);
    scaleXVal.textContent = val.toFixed(2) + 'x';
    updateActiveLayer('scaleX', val);
  });

  scaleYInput.addEventListener('input', () => {
    const val = parseFloat(scaleYInput.value);
    scaleYVal.textContent = val.toFixed(2) + 'x';
    updateActiveLayer('scaleY', val);
  });

  rotateInput.addEventListener('input', () => {
    const deg = parseInt(rotateInput.value);
    rotateVal.textContent = deg + '°';
    updateActiveLayer('rotation', deg);
  });

  skewXInput.addEventListener('input', () => {
    const deg = parseInt(skewXInput.value);
    skewXVal.textContent = deg + '°';
    updateActiveLayer('skewX', deg);
  });

  curveInput.addEventListener('input', () => {
    const deg = parseInt(curveInput.value);
    curveVal.textContent = deg + '°';
    updateActiveLayer('curveAngle', deg);
  });

  boldToggle.addEventListener('click', () => {
    boldToggle.classList.toggle('active');
    updateActiveLayer('bold', boldToggle.classList.contains('active'));
  });

  italicToggle.addEventListener('click', () => {
    italicToggle.classList.toggle('active');
    updateActiveLayer('italic', italicToggle.classList.contains('active'));
  });

  // Keyboard Shortcuts (Ctrl+D / Cmd+D for Duplication)
  document.addEventListener('keydown', (e) => {
    // Only trigger shortcut if user is not currently typing in a text field
    const activeEl = document.activeElement;
    const isEditingText = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
    
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      if (!isEditingText && state.selectedLayerId) {
        e.preventDefault();
        duplicateLayerById(state.selectedLayerId);
      }
    }
  });

  // Color picker event listeners
  colorTypeSelect.addEventListener('change', () => {
    const type = colorTypeSelect.value;
    updateActiveLayer('colorType', type);
    if (type === 'solid') {
      solidColorWrapper.style.display = 'block';
      gradientColorWrapper.style.display = 'none';
      patternColorWrapper.style.display = 'none';
    } else if (type === 'gradient') {
      solidColorWrapper.style.display = 'none';
      gradientColorWrapper.style.display = 'block';
      patternColorWrapper.style.display = 'none';
    } else if (type === 'pattern') {
      solidColorWrapper.style.display = 'none';
      gradientColorWrapper.style.display = 'none';
      patternColorWrapper.style.display = 'block';
      const layer = state.layers.find(l => l.id === state.selectedLayerId);
      if (layer && !layer.patternImageObj) {
        setTimeout(() => patternImageInput.click(), 50);
      }
    }
  });

  solidColorInput.addEventListener('input', () => {
    solidColorText.value = solidColorInput.value;
    updateActiveLayer('fillSolid', solidColorInput.value);
  });
  solidColorText.addEventListener('input', () => {
    if (isValidHex(solidColorText.value)) {
      solidColorInput.value = solidColorText.value;
      updateActiveLayer('fillSolid', solidColorText.value);
    }
  });

  gradientStartInput.addEventListener('input', () => {
    gradientStartText.value = gradientStartInput.value;
    updateActiveLayer('fillGradStart', gradientStartInput.value);
  });
  gradientStartText.addEventListener('input', () => {
    if (isValidHex(gradientStartText.value)) {
      gradientStartInput.value = gradientStartText.value;
      updateActiveLayer('fillGradStart', gradientStartText.value);
    }
  });

  gradientEndInput.addEventListener('input', () => {
    gradientEndText.value = gradientEndInput.value;
    updateActiveLayer('fillGradEnd', gradientEndInput.value);
  });
  gradientEndText.addEventListener('input', () => {
    if (isValidHex(gradientEndText.value)) {
      gradientEndInput.value = gradientEndText.value;
      updateActiveLayer('fillGradEnd', gradientEndText.value);
    }
  });

  gradientAngleInput.addEventListener('input', () => {
    const deg = parseInt(gradientAngleInput.value);
    gradientAngleVal.textContent = deg + '°';
    updateActiveLayer('fillGradAngle', deg);
  });

  // Pattern image listener
  patternImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !state.selectedLayerId) return;

    const layer = state.layers.find(l => l.id === state.selectedLayerId);
    if (!layer) return;

    layer.patternImageFile = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        layer.patternImageObj = img;
        draw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  patternScaleInput.addEventListener('input', () => {
    const scale = parseFloat(patternScaleInput.value);
    patternScaleVal.textContent = scale.toFixed(1) + 'x';
    updateActiveLayer('patternScale', scale);
  });

  // Stroke event listeners
  strokeEnabled.addEventListener('change', () => {
    updateActiveLayer('strokeEnabled', strokeEnabled.checked);
    strokeSettingsWrapper.style.display = strokeEnabled.checked ? 'block' : 'none';
  });
  strokeColorInput.addEventListener('input', () => {
    strokeColorText.value = strokeColorInput.value;
    updateActiveLayer('strokeColor', strokeColorInput.value);
  });
  strokeColorText.addEventListener('input', () => {
    if (isValidHex(strokeColorText.value)) {
      strokeColorInput.value = strokeColorText.value;
      updateActiveLayer('strokeColor', strokeColorText.value);
    }
  });
  strokeWidthInput.addEventListener('input', () => {
    const w = parseInt(strokeWidthInput.value);
    strokeWidthVal.textContent = w + 'px';
    updateActiveLayer('strokeWidth', w);
  });

  // Shadow event listeners
  shadowEnabled.addEventListener('change', () => {
    updateActiveLayer('shadowEnabled', shadowEnabled.checked);
    shadowSettingsWrapper.style.display = shadowEnabled.checked ? 'block' : 'none';
  });
  shadowColorInput.addEventListener('input', () => {
    shadowColorText.value = shadowColorInput.value;
    updateActiveLayer('shadowColor', shadowColorInput.value);
  });
  shadowColorText.addEventListener('input', () => {
    if (isValidHex(shadowColorText.value)) {
      shadowColorInput.value = shadowColorText.value;
      updateActiveLayer('shadowColor', shadowColorText.value);
    }
  });
  shadowBlurInput.addEventListener('input', () => {
    const b = parseInt(shadowBlurInput.value);
    shadowBlurVal.textContent = b + 'px';
    updateActiveLayer('shadowBlur', b);
  });
  shadowXInput.addEventListener('input', () => {
    updateActiveLayer('shadowX', parseInt(shadowXInput.value) || 0);
  });
  shadowYInput.addEventListener('input', () => {
    updateActiveLayer('shadowY', parseInt(shadowYInput.value) || 0);
  });

  // Layer Background listeners
  layerBgEnabled.addEventListener('change', () => {
    const isChecked = layerBgEnabled.checked;
    updateActiveLayer('layerBgEnabled', isChecked);
    layerBgSettingsWrapper.style.display = isChecked ? 'block' : 'none';
  });

  layerBgColorInput.addEventListener('input', () => {
    layerBgColorText.value = layerBgColorInput.value;
    updateActiveLayer('layerBgColor', layerBgColorInput.value);
  });
  layerBgColorText.addEventListener('input', () => {
    if (isValidHex(layerBgColorText.value)) {
      layerBgColorInput.value = layerBgColorText.value;
      updateActiveLayer('layerBgColor', layerBgColorText.value);
    }
  });

  layerBgOpacityInput.addEventListener('input', () => {
    const op = parseFloat(layerBgOpacityInput.value);
    layerBgOpacityVal.textContent = op.toFixed(2);
    updateActiveLayer('layerBgOpacity', op);
  });

  layerBgImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !state.selectedLayerId) return;

    const layer = state.layers.find(l => l.id === state.selectedLayerId);
    if (!layer) return;

    layer.layerBgImageFile = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        layer.layerBgImageObj = img;
        draw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  layerBgFitSelect.addEventListener('change', () => {
    updateActiveLayer('layerBgFit', layerBgFitSelect.value);
  });

  layerBgPaddingInput.addEventListener('input', () => {
    updateActiveLayer('layerBgPadding', parseInt(layerBgPaddingInput.value) || 0);
  });

  layerBgRadiusInput.addEventListener('input', () => {
    updateActiveLayer('layerBgRadius', parseInt(layerBgRadiusInput.value) || 0);
  });

  // Sidebar Collapse / Expand Toggle
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      mainEditor.classList.toggle('sidebar-collapsed');
      const isCollapsed = mainEditor.classList.contains('sidebar-collapsed');
      toggleSidebarBtn.classList.toggle('active-collapsed', isCollapsed);
      if (toggleSidebarText) {
        toggleSidebarText.textContent = isCollapsed ? 'パレットを表示' : 'パレットをたたむ';
      }
      if (toggleSidebarIcon) {
        toggleSidebarIcon.setAttribute('data-lucide', isCollapsed ? 'panel-left-open' : 'panel-left-close');
        lucide.createIcons();
      }
      setTimeout(() => {
        applyCanvasDisplayScale();
      }, 100);
    });
  }

  // Zoom Control Buttons
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      let current = typeof state.userZoomScale === 'number' ? state.userZoomScale : getFitScale();
      let next = Math.max(0.2, current - 0.1);
      setZoomLevel(Math.round(next * 10) / 10);
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      let current = typeof state.userZoomScale === 'number' ? state.userZoomScale : getFitScale();
      let next = Math.min(3.0, current + 0.1);
      setZoomLevel(Math.round(next * 10) / 10);
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', () => {
      setZoomLevel('fit');
    });
  }

  if (zoom100Btn) {
    zoom100Btn.addEventListener('click', () => {
      setZoomLevel(1.0);
    });
  }

  // Viewport Mouse Wheel Zoom (Ctrl+Wheel or Pinch)
  if (canvasViewport) {
    canvasViewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        let current = typeof state.userZoomScale === 'number' ? state.userZoomScale : getFitScale();
        let delta = e.deltaY < 0 ? 0.05 : -0.05;
        let next = Math.min(3.0, Math.max(0.2, current + delta));
        setZoomLevel(Math.round(next * 20) / 20);
      }
    }, { passive: false });
  }

  window.addEventListener('resize', () => {
    if (state.userZoomScale === 'fit') {
      applyCanvasDisplayScale();
    }
  });

  // Global Canvas settings listeners
  canvasSizeSelect.addEventListener('change', () => {
    setupCanvasSize();
    draw();
  });
  canvasWidthInput.addEventListener('input', () => {
    setupCanvasSize();
    draw();
  });
  canvasHeightInput.addEventListener('input', () => {
    setupCanvasSize();
    draw();
  });

  bgTypeSelect.addEventListener('change', () => {
    const val = bgTypeSelect.value;
    state.canvasSettings.bgType = val;
    canvasBgColorWrapper.style.display = val === 'solid' ? 'block' : 'none';
    canvasBgImageWrapper.style.display = val === 'image' ? 'block' : 'none';
    if (val === 'image') {
      setTimeout(() => {
        canvasBgImageInput.click();
      }, 50);
    }
    draw();
  });

  canvasBgImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    state.canvasSettings.bgImageFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        bgImageObject = img;
        draw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  canvasBgImageFitSelect.addEventListener('change', () => {
    state.canvasSettings.bgImageFit = canvasBgImageFitSelect.value;
    draw();
  });

  canvasBgColorInput.addEventListener('input', () => {
    canvasBgColorText.value = canvasBgColorInput.value;
    state.canvasSettings.bgColor = canvasBgColorInput.value;
    draw();
  });
  canvasBgColorText.addEventListener('input', () => {
    const val = canvasBgColorText.value;
    if (isValidHex(val)) {
      canvasBgColorInput.value = val;
      state.canvasSettings.bgColor = val;
      draw();
    }
  });

  // Action Button listeners
  addTextBtn.addEventListener('click', addTextLayer);
  
  deleteBtn.addEventListener('click', () => {
    if (state.selectedLayerId) deleteLayerById(state.selectedLayerId);
  });

  duplicateBtn.addEventListener('click', () => {
    if (!state.selectedLayerId) return;
    const current = state.layers.find(l => l.id === state.selectedLayerId);
    if (!current) return;

    // Offset slightly
    const copy = JSON.parse(JSON.stringify(current));
    copy.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    copy.x += 30;
    copy.y += 30;
    
    state.layers.push(copy);
    selectLayer(copy.id);
    draw();
  });

  moveFrontBtn.addEventListener('click', () => {
    if (!state.selectedLayerId) return;
    const index = state.layers.findIndex(l => l.id === state.selectedLayerId);
    if (index === -1 || index === state.layers.length - 1) return;
    
    // Splice out and push to top of stack
    const target = state.layers.splice(index, 1)[0];
    state.layers.push(target);
    renderLayersList();
    draw();
  });

  moveBackBtn.addEventListener('click', () => {
    if (!state.selectedLayerId) return;
    const index = state.layers.findIndex(l => l.id === state.selectedLayerId);
    if (index === -1 || index === 0) return;

    // Splice out and insert at index 0
    const target = state.layers.splice(index, 1)[0];
    state.layers.unshift(target);
    renderLayersList();
    draw();
  });

  exportBtn.addEventListener('click', exportCanvasToPng);

  // Modal event wiring
  const exportModal = document.getElementById('exportModal');
  const exportHtmlBtn = document.getElementById('exportHtmlBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  
  const tabPreviewBtn = document.getElementById('tabPreviewBtn');
  const tabCodeBtn = document.getElementById('tabCodeBtn');
  const modalPreviewTab = document.getElementById('modalPreviewTab');
  const modalCodeTab = document.getElementById('modalCodeTab');
  
  const exportPreviewIframe = document.getElementById('exportPreviewIframe');
  const exportCodeText = document.getElementById('exportCodeText');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const downloadHtmlSubmitBtn = document.getElementById('downloadHtmlSubmitBtn');
  
  const exportZipNotice = document.getElementById('exportZipNotice');
  const exportHtmlNotice = document.getElementById('exportHtmlNotice');

  // Open Modal
  exportHtmlBtn.addEventListener('click', () => {
    const prevSelectedId = state.selectedLayerId;
    selectLayer(null);
    draw();

    const hasAssets = hasAnyAssets();
    
    // Generate self-contained HTML (Base64 bg/patterns if exist) for direct previewing in iframe
    const htmlCode = generateHtmlContent(false);
    
    // Generate code for display in tab (referencing local file for ZIP, or Base64/solid/transparent)
    const displayCode = generateHtmlContent(hasAssets);
    exportCodeText.textContent = displayCode;
    
    const iframeDoc = exportPreviewIframe.contentDocument || exportPreviewIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlCode);
    iframeDoc.close();
    
    if (hasAssets) {
      exportZipNotice.style.display = 'block';
      exportHtmlNotice.style.display = 'none';
    } else {
      exportZipNotice.style.display = 'none';
      exportHtmlNotice.style.display = 'block';
    }
    
    switchTab('preview');
    exportModal.style.display = 'flex';
    
    selectLayer(prevSelectedId);
    draw();
  });

  const closeModal = () => {
    exportModal.style.display = 'none';
  };
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      closeModal();
    }
  });

  function switchTab(tab) {
    if (tab === 'preview') {
      tabPreviewBtn.classList.add('active');
      tabCodeBtn.classList.remove('active');
      modalPreviewTab.style.display = 'flex';
      modalCodeTab.style.display = 'none';
    } else {
      tabPreviewBtn.classList.remove('active');
      tabCodeBtn.classList.add('active');
      modalPreviewTab.style.display = 'none';
      modalCodeTab.style.display = 'flex';
    }
  }
  
  tabPreviewBtn.addEventListener('click', () => switchTab('preview'));
  tabCodeBtn.addEventListener('click', () => switchTab('code'));

  copyCodeBtn.addEventListener('click', () => {
    const code = exportCodeText.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const originalText = copyCodeBtn.innerHTML;
      copyCodeBtn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i> コピー完了！';
      lucide.createIcons();
      setTimeout(() => {
        copyCodeBtn.innerHTML = originalText;
        lucide.createIcons();
      }, 2000);
    });
  });

  downloadHtmlSubmitBtn.addEventListener('click', () => {
    const hasAssets = hasAnyAssets();
    
    if (hasAssets) {
      downloadHtmlSubmitBtn.disabled = true;
      const originalText = downloadHtmlSubmitBtn.innerHTML;
      downloadHtmlSubmitBtn.innerHTML = '<i data-lucide="loader" style="width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block;"></i> 準備中...';
      lucide.createIcons();

      loadJSZip().then(() => {
        const zip = new JSZip();
        const htmlCode = generateHtmlContent(true);
        zip.file('index.html', htmlCode);

        // Global background image
        if (state.canvasSettings.bgType === 'image' && bgImageObject) {
          const bgFilename = getSanitizedBgFilename();
          const base64Data = bgImageObject.src.split(',')[1];
          if (base64Data) zip.file(bgFilename, base64Data, {base64: true});
        }

        // Layer assets (background images & texture patterns)
        state.layers.forEach((layer, idx) => {
          if (layer.layerBgImageObj && layer.layerBgImageObj.src.includes(',')) {
            const base64 = layer.layerBgImageObj.src.split(',')[1];
            zip.file(`layer_bg_${idx}.png`, base64, {base64: true});
          }
          if (layer.patternImageObj && layer.patternImageObj.src.includes(',')) {
            const base64 = layer.patternImageObj.src.split(',')[1];
            zip.file(`layer_pat_${idx}.png`, base64, {base64: true});
          }
        });
        
        zip.generateAsync({type: 'blob'}).then((content) => {
          const url = URL.createObjectURL(content);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Typography_Export_${Date.now()}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          downloadHtmlSubmitBtn.disabled = false;
          downloadHtmlSubmitBtn.innerHTML = originalText;
          lucide.createIcons();
          closeModal();
        });
      }).catch((err) => {
        alert('ZIPの作成に失敗しました。ライブラリの読み込みでエラーが発生した可能性があります。\nエラー: ' + err.message);
        downloadHtmlSubmitBtn.disabled = false;
        downloadHtmlSubmitBtn.innerHTML = originalText;
        lucide.createIcons();
      });
    } else {
      const htmlCode = generateHtmlContent(false);
      const blob = new Blob([htmlCode], {type: 'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Typography_Export_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      closeModal();
    }
  });
}

// Get canvas relative mouse coordinates
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate relative scaling factors in case display size differs from coordinate size
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Drag Pointer Event Handlers
function handlePointerDown(e) {
  const pos = getMousePos(e);
  
  // Search top to bottom (reverse order) for target clicks
  let hitFound = false;
  for (let i = state.layers.length - 1; i >= 0; i--) {
    const layer = state.layers[i];
    if (hitTestLayer(layer, pos.x, pos.y)) {
      selectLayer(layer.id);
      state.drag.isDragging = true;
      state.drag.startX = pos.x - layer.x;
      state.drag.startY = pos.y - layer.y;
      hitFound = true;
      break;
    }
  }

  if (!hitFound) {
    // Clicked empty canvas space, deselect
    selectLayer(null);
  }
  draw();
}

function handlePointerMove(e) {
  if (!state.drag.isDragging || !state.selectedLayerId) return;

  const pos = getMousePos(e);
  const layer = state.layers.find(l => l.id === state.selectedLayerId);
  if (!layer) return;

  // Move layer coordinates
  layer.x = pos.x - state.drag.startX;
  layer.y = pos.y - state.drag.startY;

  draw();
}

function handlePointerUp() {
  state.drag.isDragging = false;
}

// Helper: updates selected layer setting and triggers redraw
function updateActiveLayer(key, value) {
  if (!state.selectedLayerId) return;
  const layer = state.layers.find(l => l.id === state.selectedLayerId);
  if (!layer) return;

  layer[key] = value;
  draw();
}

// Export Canvas to PNG
function exportCanvasToPng() {
  // Deselect active layer before saving to prevent drawing selection border on output PNG!
  const prevSelectedId = state.selectedLayerId;
  selectLayer(null);
  draw();

  // Create virtual download trigger
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `Typography_Props_${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Restore selection
  selectLayer(prevSelectedId);
  draw();
}

// Utilities
function isValidHex(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: load JSZip dynamically
function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (window.JSZip) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('JSZip failed to load'));
    document.body.appendChild(script);
  });
}

// Helper: sanitize background filename
function getSanitizedBgFilename() {
  if (state.canvasSettings.bgImageFile) {
    const origName = state.canvasSettings.bgImageFile.name;
    return origName.replace(/[^a-zA-Z0-9.]/g, '_');
  }
  return 'background.png';
}

function hasAnyAssets() {
  const globalBg = state.canvasSettings.bgType === 'image' && bgImageObject;
  const layerAssets = state.layers.some(l => l.layerBgImageObj || l.patternImageObj);
  return globalBg || layerAssets;
}

// Generate HTML Content
function generateHtmlContent(useZipImageReference = false) {
  const w = state.canvasSettings.width;
  const h = state.canvasSettings.height;

  // 1. Google Font Links
  const uniqueFonts = [...new Set(state.layers.map(l => l.fontFamily))];
  let fontLinks = '';
  uniqueFonts.forEach(font => {
    if (font && !['sans-serif', 'serif', 'monospace'].includes(font)) {
      const fontKey = font.replace(/\s+/g, '+');
      fontLinks += `  <link href="https://fonts.googleapis.com/css2?family=${fontKey}:wght@400;700&display=swap" rel="stylesheet">\n`;
    }
  });

  // 2. Container Background CSS
  let bgCss = '';
  if (state.canvasSettings.bgType === 'solid') {
    bgCss = `background-color: ${state.canvasSettings.bgColor};`;
  } else if (state.canvasSettings.bgType === 'image' && bgImageObject) {
    let bgUrl = useZipImageReference ? `./${getSanitizedBgFilename()}` : bgImageObject.src;
    bgCss = `background-image: url('${bgUrl}');`;
    
    const fit = state.canvasSettings.bgImageFit;
    if (fit === 'stretch') {
      bgCss += ` background-size: 100% 100%; background-position: center; background-repeat: no-repeat;`;
    } else if (fit === 'original') {
      bgCss += ` background-size: auto; background-position: center; background-repeat: no-repeat;`;
    } else if (fit === 'contain') {
      bgCss += ` background-size: contain; background-position: center; background-repeat: no-repeat;`;
    } else { // 'cover'
      bgCss += ` background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }
  } else {
    bgCss = `background: transparent;`;
  }

  // 3. Render Layers
  let layersHtml = '';
  state.layers.forEach((layer, idx) => {
    const isCurved = Math.abs(layer.curveAngle) >= 1;

    // Drop shadow styling using filter: drop-shadow
    let shadowStyle = '';
    if (layer.shadowEnabled) {
      shadowStyle = `filter: drop-shadow(${layer.shadowX}px ${layer.shadowY}px ${layer.shadowBlur}px ${layer.shadowColor});`;
    }

    // Layer Box Background CSS (if layerBgEnabled)
    let boxBgStyles = [];
    if (layer.layerBgEnabled) {
      if (layer.layerBgColor) {
        boxBgStyles.push(`background-color: ${layer.layerBgColor}`);
      }
      if (layer.layerBgOpacity !== undefined && layer.layerBgOpacity < 1.0) {
        boxBgStyles.push(`opacity: ${layer.layerBgOpacity}`);
      }
      if (layer.layerBgPadding) {
        boxBgStyles.push(`padding: ${layer.layerBgPadding}px`);
      }
      if (layer.layerBgRadius) {
        boxBgStyles.push(`border-radius: ${layer.layerBgRadius}px`);
      }
      if (layer.layerBgImageObj) {
        const bgImgUrl = useZipImageReference ? `./layer_bg_${idx}.png` : layer.layerBgImageObj.src;
        boxBgStyles.push(`background-image: url('${bgImgUrl}')`);
        const fit = layer.layerBgFit || 'cover';
        if (fit === 'stretch') {
          boxBgStyles.push(`background-size: 100% 100%`);
          boxBgStyles.push(`background-repeat: no-repeat`);
        } else if (fit === 'tile') {
          boxBgStyles.push(`background-size: auto`);
          boxBgStyles.push(`background-repeat: repeat`);
        } else {
          boxBgStyles.push(`background-size: ${fit}`);
          boxBgStyles.push(`background-position: center`);
          boxBgStyles.push(`background-repeat: no-repeat`);
        }
      }
    }

    if (!isCurved) {
      // Base styles for font and spacing
      let baseStyles = [];
      baseStyles.push(`font-family: '${layer.fontFamily}', sans-serif`);
      baseStyles.push(`font-size: ${layer.fontSize}px`);
      baseStyles.push(`font-weight: ${layer.bold ? 'bold' : 'normal'}`);
      baseStyles.push(`font-style: ${layer.italic ? 'italic' : 'normal'}`);
      if (layer.letterSpacing !== 0) {
        baseStyles.push(`letter-spacing: ${layer.letterSpacing}px`);
      }
      baseStyles.push(`white-space: nowrap`);

      const rotation = layer.rotation || 0;
      const skewX = layer.skewX || 0;
      const scaleX = layer.scaleX !== undefined ? layer.scaleX : 1.0;
      const scaleY = layer.scaleY !== undefined ? layer.scaleY : 1.0;
      const transformStyle = `transform: translate(-50%, -50%) rotate(${rotation}deg) skewX(${skewX}deg) scale(${scaleX}, ${scaleY}); transform-origin: center center;`;

      // Fill styles
      let fillStyles = [];
      if (layer.colorType === 'solid') {
        fillStyles.push(`color: ${layer.fillSolid}`);
      } else if (layer.colorType === 'gradient') {
        const cssGradAngle = (layer.fillGradAngle + 90) % 360;
        fillStyles.push(`background: linear-gradient(${cssGradAngle}deg, ${layer.fillGradStart}, ${layer.fillGradEnd})`);
        fillStyles.push(`-webkit-background-clip: text`);
        fillStyles.push(`background-clip: text`);
        fillStyles.push(`-webkit-text-fill-color: transparent`);
        fillStyles.push(`display: inline-block`);
      } else if (layer.colorType === 'pattern' && layer.patternImageObj) {
        const patImgUrl = useZipImageReference ? `./layer_pat_${idx}.png` : layer.patternImageObj.src;
        fillStyles.push(`background-image: url('${patImgUrl}')`);
        fillStyles.push(`background-size: ${((layer.patternScale || 1.0) * 100).toFixed(0)}%`);
        fillStyles.push(`background-repeat: repeat`);
        fillStyles.push(`-webkit-background-clip: text`);
        fillStyles.push(`background-clip: text`);
        fillStyles.push(`-webkit-text-fill-color: transparent`);
        fillStyles.push(`display: inline-block`);
      }

      if (layer.strokeEnabled) {
        const doubleStrokeWidth = layer.strokeWidth * 2;
        
        const strokeStyles = [
          `position: absolute`,
          `left: 0`,
          `top: 0`,
          `z-index: 1`,
          `color: ${layer.strokeColor}`,
          `-webkit-text-stroke: ${doubleStrokeWidth}px ${layer.strokeColor}`
        ].join('; ');

        const innerFillStyles = [
          `position: relative`,
          `z-index: 2`
        ].concat(fillStyles).join('; ');

        const wrapperStyles = [
          `position: absolute`,
          `left: ${layer.x.toFixed(1)}px`,
          `top: ${layer.y.toFixed(1)}px`,
          transformStyle,
          shadowStyle
        ].concat(boxBgStyles).filter(Boolean).join('; ');

        layersHtml += `    <div style="${wrapperStyles}">
      <div style="${strokeStyles}">${escapeHtml(layer.text)}</div>
      <div style="${innerFillStyles}">${escapeHtml(layer.text)}</div>
    </div>\n`;
      } else {
        // No stroke: single element
        const singleStyles = [
          `position: absolute`,
          `left: ${layer.x.toFixed(1)}px`,
          `top: ${layer.y.toFixed(1)}px`,
          transformStyle,
          shadowStyle
        ].concat(boxBgStyles).concat(baseStyles).concat(fillStyles).filter(Boolean).join('; ');

        layersHtml += `    <div style="${singleStyles}">${escapeHtml(layer.text)}</div>\n`;
      }
    } else {
      const chars = Array.from(layer.text);
      
      const canvasEl = document.createElement('canvas');
      const tempCtx = canvasEl.getContext('2d');
      tempCtx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px "${layer.fontFamily}"`;
      
      let totalTextW = 0;
      const charWidths = chars.map(char => {
        const w = tempCtx.measureText(char).width;
        totalTextW += w;
        return w;
      });

      const spacing = layer.letterSpacing;
      const totalSpacedW = totalTextW + (chars.length - 1) * spacing;
      const theta = Math.abs(layer.curveAngle) * Math.PI / 180;
      const r = totalSpacedW / theta;
      const isArch = layer.curveAngle > 0;

      let parentStyles = [];
      parentStyles.push(`position: absolute`);
      parentStyles.push(`left: ${layer.x.toFixed(1)}px`);
      parentStyles.push(`top: ${layer.y.toFixed(1)}px`);
      parentStyles.push(`width: ${totalSpacedW.toFixed(1)}px`);
      parentStyles.push(`height: ${(layer.fontSize * 1.5).toFixed(1)}px`);
      
      const rotation = layer.rotation || 0;
      const skewX = layer.skewX || 0;
      const scaleX = layer.scaleX !== undefined ? layer.scaleX : 1.0;
      const scaleY = layer.scaleY !== undefined ? layer.scaleY : 1.0;
      parentStyles.push(`transform: translate(-50%, -50%) rotate(${rotation}deg) skewX(${skewX}deg) scale(${scaleX}, ${scaleY})`);
      parentStyles.push(`transform-origin: center center`);
      parentStyles.push(`font-family: '${layer.fontFamily}', sans-serif`);
      parentStyles.push(`font-size: ${layer.fontSize}px`);
      parentStyles.push(`font-weight: ${layer.bold ? 'bold' : 'normal'}`);
      parentStyles.push(`font-style: ${layer.italic ? 'italic' : 'normal'}`);
      
      if (shadowStyle) {
        parentStyles.push(shadowStyle.replace(';', ''));
      }
      boxBgStyles.forEach(st => parentStyles.push(st));

      let charsHtml = '';
      let cumulativeW = 0;
      chars.forEach((char, charIdx) => {
        const charW = charWidths[charIdx];
        const centerOffset = cumulativeW + charW / 2 - totalSpacedW / 2;
        const charAngle = (centerOffset / totalSpacedW) * theta;
        const a = isArch ? charAngle : -charAngle;

        let localX, localY;
        if (isArch) {
          localX = r * Math.sin(a);
          localY = r - r * Math.cos(a);
        } else {
          localX = -r * Math.sin(a);
          localY = -r + r * Math.cos(a);
        }

        const charRotDeg = (a * 180 / Math.PI);
        const posStyle = `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) translate(${localX.toFixed(1)}px, ${localY.toFixed(1)}px) rotate(${charRotDeg.toFixed(1)}deg); transform-origin: center center; display: inline-block; white-space: nowrap;`;

        if (layer.strokeEnabled) {
          const doubleStrokeWidth = layer.strokeWidth * 2;
          let strokeStyles = [posStyle, `z-index: 1`, `color: ${layer.strokeColor}`, `-webkit-text-stroke: ${doubleStrokeWidth}px ${layer.strokeColor}`];
          let fillStyles = [posStyle, `z-index: 2`];
          
          if (layer.colorType === 'solid') {
            fillStyles.push(`color: ${layer.fillSolid}`);
          } else if (layer.colorType === 'gradient') {
            const cssGradAngle = (layer.fillGradAngle + 90) % 360;
            fillStyles.push(`background: linear-gradient(${cssGradAngle}deg, ${layer.fillGradStart}, ${layer.fillGradEnd})`);
            fillStyles.push(`-webkit-background-clip: text`);
            fillStyles.push(`background-clip: text`);
            fillStyles.push(`-webkit-text-fill-color: transparent`);
          } else if (layer.colorType === 'pattern' && layer.patternImageObj) {
            const patImgUrl = useZipImageReference ? `./layer_pat_${idx}.png` : layer.patternImageObj.src;
            fillStyles.push(`background-image: url('${patImgUrl}')`);
            fillStyles.push(`background-size: ${((layer.patternScale || 1.0) * 100).toFixed(0)}%`);
            fillStyles.push(`background-repeat: repeat`);
            fillStyles.push(`-webkit-background-clip: text`);
            fillStyles.push(`background-clip: text`);
            fillStyles.push(`-webkit-text-fill-color: transparent`);
          }

          charsHtml += `      <span style="${strokeStyles.join('; ')}">${escapeHtml(char)}</span>\n`;
          charsHtml += `      <span style="${fillStyles.join('; ')}">${escapeHtml(char)}</span>\n`;
        } else {
          let singleStyles = [posStyle];
          if (layer.colorType === 'solid') {
            singleStyles.push(`color: ${layer.fillSolid}`);
          } else if (layer.colorType === 'gradient') {
            const cssGradAngle = (layer.fillGradAngle + 90) % 360;
            singleStyles.push(`background: linear-gradient(${cssGradAngle}deg, ${layer.fillGradStart}, ${layer.fillGradEnd})`);
            singleStyles.push(`-webkit-background-clip: text`);
            singleStyles.push(`background-clip: text`);
            singleStyles.push(`-webkit-text-fill-color: transparent`);
          } else if (layer.colorType === 'pattern' && layer.patternImageObj) {
            const patImgUrl = useZipImageReference ? `./layer_pat_${idx}.png` : layer.patternImageObj.src;
            singleStyles.push(`background-image: url('${patImgUrl}')`);
            singleStyles.push(`background-size: ${((layer.patternScale || 1.0) * 100).toFixed(0)}%`);
            singleStyles.push(`background-repeat: repeat`);
            singleStyles.push(`-webkit-background-clip: text`);
            singleStyles.push(`background-clip: text`);
            singleStyles.push(`-webkit-text-fill-color: transparent`);
          }
          charsHtml += `      <span style="${singleStyles.join('; ')}">${escapeHtml(char)}</span>\n`;
        }

        cumulativeW += charW + spacing;
      });

      layersHtml += `    <div style="${parentStyles.join('; ')}">\n${charsHtml}    </div>\n`;
    }
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exported Typography | CreateProps</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLinks}  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #121214;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: auto;
    }
    .canvas-container {
      position: relative;
      width: ${w}px;
      height: ${h}px;
      ${bgCss}
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="canvas-container">
${layersHtml}  </div>
</body>
</html>`;
}
