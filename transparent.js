/**
 * Transparent PNG Studio v3.0
 * AI Background Removal (U-2-Net, Apache 2.0) + Semi-Transparent Layer Material Creator
 */

// --- DOM Elements ---
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const origCanvas = document.getElementById("originalCanvas");
const resCanvas = document.getElementById("resultCanvas");
const ctxOrig = origCanvas.getContext("2d", { willReadFrequently: true });
const ctxRes = resCanvas.getContext("2d");

const origContainer = document.getElementById("origContainer");
const resContainer = document.getElementById("resContainer");
const origEmptyState = document.getElementById("origEmptyState");
const resEmptyState = document.getElementById("resEmptyState");
const processingSpinner = document.getElementById("processingSpinner");
const spinnerText = document.getElementById("spinnerText");
const origDimTag = document.getElementById("origDimTag");
const resStatusTag = document.getElementById("resStatusTag");
const sourceHeaderLabel = document.getElementById("sourceHeaderLabel");

// Mode Tabs (AI vs Color)
const modeAiBtn = document.getElementById("modeAiBtn");
const modeColorBtn = document.getElementById("modeColorBtn");
const aiCutoutPanel = document.getElementById("aiCutoutPanel");
const colorCutoutPanel = document.getElementById("colorCutoutPanel");
const runAiBtn = document.getElementById("runAiBtn");

// Color Cutout Elements
const bgColorBox = document.getElementById("bgColorBox");
const bgNativePicker = document.getElementById("bgNativePicker");
const bgHexText = document.getElementById("bgHexText");
const bgPickBtn = document.getElementById("bgPickBtn");
const autoCornersBtn = document.getElementById("autoCornersBtn");
const bgTolerance = document.getElementById("bgTolerance");
const bgToleranceVal = document.getElementById("bgToleranceVal");
const seedCount = document.getElementById("seedCount");
const resetSeedsBtn = document.getElementById("resetSeedsBtn");

// Step 2: Subject Semi-Transparency
const subjectOpacity = document.getElementById("subjectOpacity");
const subjectOpacityVal = document.getElementById("subjectOpacityVal");
const glassColorBox = document.getElementById("glassColorBox");
const glassNativePicker = document.getElementById("glassNativePicker");
const glassHexText = document.getElementById("glassHexText");
const glassPickBtn = document.getElementById("glassPickBtn");
const glassRange = document.getElementById("glassRange");
const glassRangeVal = document.getElementById("glassRangeVal");
const glassStrength = document.getElementById("glassStrength");
const glassStrengthVal = document.getElementById("glassStrengthVal");

// Edge & Tuning
const feather = document.getElementById("feather");
const featherVal = document.getElementById("featherVal");
const choke = document.getElementById("choke");
const chokeVal = document.getElementById("chokeVal");

// Actions & Toolbar
const saveBtn = document.getElementById("saveBtn");
const copyBtn = document.getElementById("copyBtn");
const viewDualBtn = document.getElementById("viewDualBtn");
const viewSingleBtn = document.getElementById("viewSingleBtn");
const canvasesGrid = document.getElementById("canvasesGrid");
const bgDotBtns = document.querySelectorAll(".bg-dot-btn");

// --- State ---
let cutoutMode = "ai"; // 'ai' | 'color'
let imageLoaded = false;
let originalImageData = null;
let activeEyedropperTarget = "bg"; // 'bg' | 'glass'
let bgColor = [255, 255, 255];
let glassColor = [255, 255, 255];
let manualSeeds = [];

// AI Cache & Session
let ortSession = null;
let isModelLoading = false;
let cachedAiMask = null; // Float32Array of original image dimensions (0.0=bg, 1.0=subject)

let debounceTimer = null;
let isProcessing = false;

// Configure ONNX Runtime Web WASM path
if (window.ort) {
  ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
}

// --- CIELAB Color Space Helpers ---
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
}

function hexToRgb(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToLab(r, g, b) {
  let sr = r / 255, sg = g / 255, sb = b / 255;
  sr = (sr > 0.04045) ? Math.pow((sr + 0.055) / 1.055, 2.4) : sr / 12.92;
  sg = (sg > 0.04045) ? Math.pow((sg + 0.055) / 1.055, 2.4) : sg / 12.92;
  sb = (sb > 0.04045) ? Math.pow((sb + 0.055) / 1.055, 2.4) : sb / 12.92;

  let x = (sr * 0.4124 + sg * 0.3576 + sb * 0.1805) * 100;
  let y = (sr * 0.2126 + sg * 0.7152 + sb * 0.0722) * 100;
  let z = (sr * 0.0193 + sg * 0.1192 + sb * 0.9505) * 100;

  x /= 95.047; y /= 100.000; z /= 108.883;
  x = (x > 0.008856) ? Math.cbrt(x) : (7.787 * x) + (16 / 116);
  y = (y > 0.008856) ? Math.cbrt(y) : (7.787 * y) + (16 / 116);
  z = (z > 0.008856) ? Math.cbrt(z) : (7.787 * z) + (16 / 116);

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function labDistance(lab1, lab2) {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

// --- Mode Switch (AI vs Color) ---
function switchCutoutMode(mode) {
  cutoutMode = mode;
  if (mode === "ai") {
    modeAiBtn.classList.add("active");
    modeColorBtn.classList.remove("active");
    aiCutoutPanel.style.display = "block";
    colorCutoutPanel.style.display = "none";
    sourceHeaderLabel.textContent = "元画像";
    if (imageLoaded && !cachedAiMask) {
      runAiBackgroundRemoval();
    } else {
      scheduleComposite();
    }
  } else {
    modeColorBtn.classList.add("active");
    modeAiBtn.classList.remove("active");
    aiCutoutPanel.style.display = "none";
    colorCutoutPanel.style.display = "block";
    sourceHeaderLabel.textContent = "元画像 (クリックで色取得)";
    scheduleComposite();
  }
}

modeAiBtn.addEventListener("click", () => switchCutoutMode("ai"));
modeColorBtn.addEventListener("click", () => switchCutoutMode("color"));

// --- Eyedropper Selection ---
function setActiveEyedropper(target) {
  activeEyedropperTarget = target;
  if (target === "bg") {
    bgPickBtn.classList.add("active");
    glassPickBtn.classList.remove("active");
  } else {
    glassPickBtn.classList.add("active");
    bgPickBtn.classList.remove("active");
  }
}

bgPickBtn.addEventListener("click", () => setActiveEyedropper("bg"));
glassPickBtn.addEventListener("click", () => setActiveEyedropper("glass"));

function setBackgroundColor(r, g, b) {
  bgColor = [r, g, b];
  const hex = rgbToHex(r, g, b);
  bgColorBox.style.backgroundColor = hex;
  bgNativePicker.value = hex;
  bgHexText.textContent = `${hex}`;
  scheduleComposite();
}

function setGlassColor(r, g, b) {
  glassColor = [r, g, b];
  const hex = rgbToHex(r, g, b);
  glassColorBox.style.backgroundColor = hex;
  glassNativePicker.value = hex;
  glassHexText.textContent = `${hex}`;
  scheduleComposite();
}

bgNativePicker.addEventListener("input", (e) => {
  const [r, g, b] = hexToRgb(e.target.value);
  setBackgroundColor(r, g, b);
});

glassNativePicker.addEventListener("input", (e) => {
  const [r, g, b] = hexToRgb(e.target.value);
  setGlassColor(r, g, b);
});

// --- Image Loading ---
function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => setupCanvasWithImage(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setupCanvasWithImage(img) {
  origCanvas.width = img.width;
  origCanvas.height = img.height;
  resCanvas.width = img.width;
  resCanvas.height = img.height;

  ctxOrig.clearRect(0, 0, img.width, img.height);
  ctxOrig.drawImage(img, 0, 0);

  originalImageData = ctxOrig.getImageData(0, 0, img.width, img.height);
  imageLoaded = true;
  cachedAiMask = null; // 新しい画像なのでAIマスクをクリア
  manualSeeds = [];
  updateSeedBadge();

  origEmptyState.style.display = "none";
  resEmptyState.style.display = "none";
  origCanvas.style.display = "block";
  resCanvas.style.display = "block";

  origDimTag.textContent = `${img.width} × ${img.height} px`;
  resStatusTag.textContent = "読込完了";

  saveBtn.disabled = false;
  copyBtn.disabled = false;
  runAiBtn.disabled = false;

  // 四隅サンプリング
  autoSampleCornerBg();

  // AIモードなら即座に自動切り抜きを実行
  if (cutoutMode === "ai") {
    runAiBackgroundRemoval();
  } else {
    scheduleComposite();
  }
}

function autoSampleCornerBg() {
  if (!imageLoaded || !originalImageData) return;
  const w = origCanvas.width, h = origCanvas.height;
  const d = originalImageData.data;
  const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];

  let rSum = 0, gSum = 0, bSum = 0;
  corners.forEach(([cx, cy]) => {
    const idx = (cy * w + cx) * 4;
    rSum += d[idx];
    gSum += d[idx + 1];
    bSum += d[idx + 2];
  });
  setBackgroundColor(Math.round(rSum / 4), Math.round(gSum / 4), Math.round(bSum / 4));
}

autoCornersBtn.addEventListener("click", autoSampleCornerBg);

// DropZone & Events
fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
});

// Clipboard Paste
window.addEventListener("paste", (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      handleFile(items[i].getAsFile());
      break;
    }
  }
});

// --- Canvas Coordinate Conversion ---
function getCanvasCoords(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  return [Math.max(0, Math.min(canvas.width - 1, x)), Math.max(0, Math.min(canvas.height - 1, y))];
}

origCanvas.addEventListener("click", (e) => {
  if (!imageLoaded) return;
  const [x, y] = getCanvasCoords(origCanvas, e);
  const idx = (y * origCanvas.width + x) * 4;
  const d = originalImageData.data;

  if (activeEyedropperTarget === "bg") {
    setBackgroundColor(d[idx], d[idx + 1], d[idx + 2]);
  } else {
    setGlassColor(d[idx], d[idx + 1], d[idx + 2]);
  }
});

resCanvas.addEventListener("click", (e) => {
  if (!imageLoaded || cutoutMode !== "color") return;
  const [x, y] = getCanvasCoords(resCanvas, e);
  manualSeeds.push([x, y]);
  updateSeedBadge();
  scheduleComposite();
});

function updateSeedBadge() {
  seedCount.textContent = manualSeeds.length;
}

resetSeedsBtn.addEventListener("click", () => {
  manualSeeds = [];
  updateSeedBadge();
  scheduleComposite();
});

// --- Sliders Setup ---
function bindSlider(slider, display, suffix = "") {
  slider.addEventListener("input", () => {
    display.textContent = slider.value + suffix;
    scheduleComposite();
  });
}

bindSlider(subjectOpacity, subjectOpacityVal, "%");
bindSlider(bgTolerance, bgToleranceVal, "");
bindSlider(glassRange, glassRangeVal, "%");
bindSlider(glassStrength, glassStrengthVal, "%");
bindSlider(feather, featherVal, "px");
bindSlider(choke, chokeVal, "px");

// =============================================================
// AI U-2-Net Background Removal Engine
// =============================================================
async function getU2NetSession() {
  if (ortSession) return ortSession;

  isModelLoading = true;
  spinnerText.textContent = "AIモデル読込中 (4.5MB)...";
  processingSpinner.style.display = "flex";

  const localModelUrl = "u2netp.onnx";
  const cdnModelUrl = "https://huggingface.co/edgetools/u2netp/resolve/main/u2netp.onnx";

  let session = null;
  try {
    // 1. ローカル優先ロード
    session = await ort.InferenceSession.create(localModelUrl, {
      executionProviders: ["wasm"]
    });
  } catch (err) {
    console.warn("Local model load failed, falling back to HuggingFace CDN:", err);
    try {
      session = await ort.InferenceSession.create(cdnModelUrl, {
        executionProviders: ["wasm"]
      });
    } catch (cdnErr) {
      console.error("CDN model load failed:", cdnErr);
      throw new Error("AIモデルの読み込みに失敗しました。インターネット接続をご確認ください。");
    }
  }

  ortSession = session;
  isModelLoading = false;
  return ortSession;
}

runAiBtn.addEventListener("click", () => {
  runAiBackgroundRemoval();
});

async function runAiBackgroundRemoval() {
  if (!imageLoaded || !originalImageData) return;

  processingSpinner.style.display = "flex";
  spinnerText.textContent = "AIが背景を認識中...";
  resStatusTag.textContent = "AI推論中...";
  runAiBtn.disabled = true;

  try {
    const session = await getU2NetSession();

    spinnerText.textContent = "被写体を切り抜き中...";

    // 1. 画像を 320x320 にリサイズしてオフスクリーンCanvasに描画
    const targetSize = 320;
    const offCanvas = document.createElement("canvas");
    offCanvas.width = targetSize;
    offCanvas.height = targetSize;
    const offCtx = offCanvas.getContext("2d");
    offCtx.drawImage(origCanvas, 0, 0, targetSize, targetSize);
    const imgData = offCtx.getImageData(0, 0, targetSize, targetSize);

    // 2. ImageNet 正規化 & NCHW テンソル作成
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    const inputData = new Float32Array(1 * 3 * targetSize * targetSize);

    const channelSize = targetSize * targetSize;
    for (let y = 0; y < targetSize; y++) {
      for (let x = 0; x < targetSize; x++) {
        const srcIdx = (y * targetSize + x) * 4;
        const r = imgData.data[srcIdx] / 255.0;
        const g = imgData.data[srcIdx + 1] / 255.0;
        const b = imgData.data[srcIdx + 2] / 255.0;

        const pixelIdx = y * targetSize + x;
        inputData[0 * channelSize + pixelIdx] = (r - mean[0]) / std[0];
        inputData[1 * channelSize + pixelIdx] = (g - mean[1]) / std[1];
        inputData[2 * channelSize + pixelIdx] = (b - mean[2]) / std[2];
      }
    }

    const inputName = session.inputNames[0];
    const inputTensor = new ort.Tensor("float32", inputData, [1, 3, targetSize, targetSize]);

    // 3. 推論実行
    const feeds = {};
    feeds[inputName] = inputTensor;
    const results = await session.run(feeds);

    const outputName = session.outputNames[0];
    const outputTensor = results[outputName];
    const predData = outputTensor.data; // Float32Array of 320x320

    // 4. Min-Max 正規化
    let minVal = Infinity, maxVal = -Infinity;
    for (let i = 0; i < predData.length; i++) {
      const v = predData[i];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    const range = (maxVal - minVal) || 1e-8;

    // 320x320 のグレースケールマスク画像を作成
    const maskCanvas320 = document.createElement("canvas");
    maskCanvas320.width = targetSize;
    maskCanvas320.height = targetSize;
    const maskCtx320 = maskCanvas320.getContext("2d");
    const maskImgData320 = maskCtx320.createImageData(targetSize, targetSize);

    for (let i = 0; i < predData.length; i++) {
      const norm = (predData[i] - minVal) / range;
      const idx = i * 4;
      const gray = Math.round(norm * 255);
      maskImgData320.data[idx] = gray;
      maskImgData320.data[idx + 1] = gray;
      maskImgData320.data[idx + 2] = gray;
      maskImgData320.data[idx + 3] = 255;
    }
    maskCtx320.putImageData(maskImgData320, 0, 0);

    // 5. 元画像サイズに拡大して cachedAiMask を作成
    const origW = origCanvas.width;
    const origH = origCanvas.height;
    const maskCanvasOrig = document.createElement("canvas");
    maskCanvasOrig.width = origW;
    maskCanvasOrig.height = origH;
    const maskCtxOrig = maskCanvasOrig.getContext("2d");
    // バイリニア補間で滑らかに拡大
    maskCtxOrig.imageSmoothingEnabled = true;
    maskCtxOrig.imageSmoothingQuality = "high";
    maskCtxOrig.drawImage(maskCanvas320, 0, 0, origW, origH);

    const fullMaskData = maskCtxOrig.getImageData(0, 0, origW, origH).data;
    const totalPixels = origW * origH;
    cachedAiMask = new Float32Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      // 0.0 (背景) 〜 1.0 (被写体)
      cachedAiMask[i] = fullMaskData[i * 4] / 255.0;
    }

    resStatusTag.textContent = "AI消去完了";
    scheduleComposite();
  } catch (err) {
    console.error("AI Background Removal Error:", err);
    alert("AI切り抜き処理中にエラーが発生しました: " + err.message);
    resStatusTag.textContent = "エラー";
  } finally {
    processingSpinner.style.display = "none";
    runAiBtn.disabled = false;
  }
}

// =============================================================
// Realtime Composite Rendering (Ultra-fast, uses cached masks)
// =============================================================
function scheduleComposite() {
  if (!imageLoaded || !originalImageData) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => renderComposite(), 30);
}

function renderComposite() {
  if (!imageLoaded || isProcessing) return;
  isProcessing = true;
  processingSpinner.style.display = "flex";
  spinnerText.textContent = "合成中...";

  requestAnimationFrame(() => {
    const width = origCanvas.width;
    const height = origCanvas.height;
    const src = originalImageData.data;
    const totalPixels = width * height;

    const outputImageData = ctxRes.createImageData(width, height);
    const out = outputImageData.data;

    const chokeSize = parseInt(choke.value, 10);
    const featherSize = parseFloat(feather.value);
    const opacityPct = parseFloat(subjectOpacity.value) / 100;

    // ガラス・特定色パラメータ
    const glassStrengthPct = parseFloat(glassStrength.value) / 100;
    const glassRangePct = parseFloat(glassRange.value) / 100;
    const targetGlassLab = rgbToLab(...glassColor);
    const maxGlassLabDist = 160 * glassRangePct;

    let baseMask = null; // 1.0 = 被写体, 0.0 = 背景

    if (cutoutMode === "ai" && cachedAiMask) {
      baseMask = cachedAiMask;
    } else {
      // カラー切り抜きモード (FloodFill)
      baseMask = computeColorMask(width, height, src);
    }

    // フチ削り (De-fringe)
    let processedMask = baseMask;
    if (chokeSize > 0) {
      const eroded = new Float32Array(totalPixels);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          let minVal = baseMask[idx];
          for (let dy = -chokeSize; dy <= chokeSize; dy++) {
            for (let dx = -chokeSize; dx <= chokeSize; dx++) {
              const tx = x + dx, ty = y + dy;
              if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                const val = baseMask[ty * width + tx];
                if (val < minVal) minVal = val;
              }
            }
          }
          eroded[idx] = minVal;
        }
      }
      processedMask = eroded;
    }

    // エッジ平滑化 (Feathering)
    if (featherSize > 0) {
      const r = Math.ceil(featherSize);
      const smoothed = new Float32Array(totalPixels);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0, count = 0;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const tx = x + dx, ty = y + dy;
              if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                sum += processedMask[ty * width + tx];
                count++;
              }
            }
          }
          smoothed[y * width + x] = sum / count;
        }
      }
      processedMask = smoothed;
    }

    // 最終ピクセル合成
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const maskVal = processedMask[i]; // 0.0=背景(完全消去), 1.0=被写体

      if (maskVal <= 0.02) {
        // 背景は完全に透明！
        out[idx] = src[idx];
        out[idx + 1] = src[idx + 1];
        out[idx + 2] = src[idx + 2];
        out[idx + 3] = 0;
        continue;
      }

      const r = src[idx], g = src[idx + 1], b = src[idx + 2];

      // ガラス・特定色透過係数
      let glassAlphaFactor = 1.0;
      if (glassStrengthPct > 0) {
        const curLab = rgbToLab(r, g, b);
        const dist = labDistance(targetGlassLab, curLab);
        if (dist <= maxGlassLabDist) {
          let sim = 1.0 - (dist / maxGlassLabDist);
          sim = sim * sim * (3.0 - 2.0 * sim);
          glassAlphaFactor = 1.0 - (sim * glassStrengthPct);
        }
      }

      // 被写体不透明度 (opacityPct) × マスク × ガラス透過
      const finalAlpha = src[idx + 3] * maskVal * opacityPct * glassAlphaFactor;

      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = Math.round(Math.max(0, Math.min(255, finalAlpha)));
    }

    ctxRes.putImageData(outputImageData, 0, 0);
    processingSpinner.style.display = "none";
    resStatusTag.textContent = "完了";
    isProcessing = false;
  });
}

// カラーモード用のFloodFillマスク計算 (0.0=背景, 1.0=被写体)
function computeColorMask(width, height, src) {
  const totalPixels = width * height;
  const tolerance = parseFloat(bgTolerance.value);
  const targetBgLab = rgbToLab(...bgColor);

  const bgMask = new Float32Array(totalPixels);
  const visited = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let head = 0, tail = 0;

  const seeds = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    ...manualSeeds
  ];

  seeds.forEach(([sx, sy]) => {
    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
      const idx = sy * width + sx;
      if (!visited[idx]) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    }
  });

  const getLabAt = (x, y) => {
    const i = (y * width + x) * 4;
    return rgbToLab(src[i], src[i + 1], src[i + 2]);
  };

  while (head < tail) {
    const currIdx = queue[head++];
    const cx = currIdx % width;
    const cy = (currIdx / width) | 0;

    const currentLab = getLabAt(cx, cy);
    const distToBg = labDistance(targetBgLab, currentLab);

    if (distToBg <= tolerance) {
      bgMask[currIdx] = 1.0;

      const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
      for (let j = 0; j < 4; j++) {
        const nx = neighbors[j][0], ny = neighbors[j][1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            const nLab = getLabAt(nx, ny);
            if (labDistance(currentLab, nLab) < tolerance * 1.6) {
              queue[tail++] = nIdx;
            }
          }
        }
      }
    }
  }

  // 1.0 - bgMask を返して「被写体=1.0, 背景=0.0」に合わせる
  const subjectMask = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    subjectMask[i] = 1.0 - bgMask[i];
  }
  return subjectMask;
}

// --- Preview Background Switcher ---
bgDotBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    bgDotBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    resContainer.classList.remove("bg-checker", "bg-dark", "bg-light", "bg-vivid");
    resContainer.classList.add(btn.dataset.bg);
  });
});

// --- View Mode Switcher ---
viewDualBtn.addEventListener("click", () => {
  viewDualBtn.classList.add("active");
  viewSingleBtn.classList.remove("active");
  canvasesGrid.classList.remove("single-view");
});

viewSingleBtn.addEventListener("click", () => {
  viewSingleBtn.classList.add("active");
  viewDualBtn.classList.remove("active");
  canvasesGrid.classList.add("single-view");
});

// --- Export & Download ---
saveBtn.addEventListener("click", () => {
  if (!imageLoaded) return;
  const link = document.createElement("a");
  link.download = `semitransparent_layer_${Date.now()}.png`;
  link.href = resCanvas.toDataURL("image/png");
  link.click();
});

copyBtn.addEventListener("click", async () => {
  if (!imageLoaded) return;
  try {
    resCanvas.toBlob(async (blob) => {
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i data-lucide="check" style="width:16px;height:16px;"></i> コピー完了!`;
      lucide.createIcons();
      setTimeout(() => {
        copyBtn.innerHTML = origText;
        lucide.createIcons();
      }, 2000);
    });
  } catch (err) {
    console.error("Copy failed:", err);
    alert("クリップボードへのコピーに失敗しました。");
  }
});
