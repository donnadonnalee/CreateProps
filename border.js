const fileInput = document.getElementById("fileInput");
const origCanvas = document.getElementById("originalCanvas");
const resCanvas = document.getElementById("resultCanvas");
const ctxOrig = origCanvas.getContext("2d", { willReadFrequently: true });
const ctxRes = resCanvas.getContext("2d");
const dropZone = document.getElementById("dropZone");
const saveBtn = document.getElementById("saveBtn");

const thicknessRange = document.getElementById("thicknessRange");
const thicknessVal = document.getElementById("thicknessVal");
const thresholdRange = document.getElementById("thresholdRange");
const thresholdVal = document.getElementById("thresholdVal");
const borderColorInput = document.getElementById("borderColorInput");
const colorHexText = document.getElementById("colorHexText");
const colorPresets = document.getElementById("colorPresets");

let activeImage = null;
let currentBorderColor = [255, 255, 255]; // RGB

// Presets
const PRESET_COLORS = [
  "#ffffff", // White
  "#000000", // Black
  "#ff3b30", // Red
  "#ff9500", // Orange
  "#ffcc00", // Yellow
  "#34c759", // Green
  "#007aff", // Blue
  "#af52de"  // Purple
];

// Initialize Presets
function initPresets() {
  colorPresets.innerHTML = "";
  PRESET_COLORS.forEach((hex, index) => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = hex;
    if (index === 0) {
      swatch.classList.add("active");
      updateBorderColor(hex);
    }
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      borderColorInput.value = hex;
      updateBorderColor(hex);
    });
    colorPresets.appendChild(swatch);
  });
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function updateBorderColor(hex) {
  currentBorderColor = hexToRgb(hex);
  colorHexText.textContent = hex.toUpperCase();
  if (activeImage) {
    processImage();
  }
}

borderColorInput.addEventListener("input", (e) => {
  // Remove active state from presets when custom color is chosen
  document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
  updateBorderColor(e.target.value);
});

// Event Listeners for controls
thicknessRange.addEventListener("input", (e) => {
  thicknessVal.textContent = e.target.value + "px";
  if (activeImage) processImage();
});

thresholdRange.addEventListener("input", (e) => {
  thresholdVal.textContent = e.target.value;
  if (activeImage) processImage();
});

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    activeImage = img;
    
    // Set size
    const maxDisplayWidth = 450;
    const displayWidth = Math.min(maxDisplayWidth, img.width);
    const displayHeight = Math.round(img.height * (displayWidth / img.width));

    origCanvas.width = img.width;
    origCanvas.height = img.height;
    resCanvas.width = img.width;
    resCanvas.height = img.height;

    origCanvas.style.width = displayWidth + "px";
    origCanvas.style.height = displayHeight + "px";
    resCanvas.style.width = displayWidth + "px";
    resCanvas.style.height = displayHeight + "px";

    ctxOrig.clearRect(0, 0, origCanvas.width, origCanvas.height);
    ctxOrig.drawImage(img, 0, 0);

    saveBtn.disabled = false;
    processImage();
  };
  img.src = URL.createObjectURL(file);
}

fileInput.addEventListener("change", e => handleFile(e.target.files[0]));

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

// Main process function using 2-pass Chamfer distance transform
function processImage() {
  if (!activeImage) return;

  const thickness = +thicknessRange.value;
  const threshold = +thresholdRange.value;
  const borderR = currentBorderColor[0];
  const borderG = currentBorderColor[1];
  const borderB = currentBorderColor[2];

  const w = origCanvas.width;
  const h = origCanvas.height;

  const imgData = ctxOrig.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Initialize distance map
  const dist = new Float32Array(w * h);

  // First pass: identify foreground vs background
  for (let i = 0; i < w * h; i++) {
    const alpha = data[i * 4 + 3];
    if (alpha > threshold) {
      dist[i] = 0; // Foreground
    } else {
      dist[i] = Infinity; // Background
    }
  }

  // 2-pass Chamfer distance transform (approx. Euclidean distance)
  // Forward pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      let d = dist[idx];
      if (d === 0) continue;

      if (x > 0) d = Math.min(d, dist[idx - 1] + 1);
      if (x > 0 && y > 0) d = Math.min(d, dist[idx - w - 1] + 1.4142);
      if (y > 0) d = Math.min(d, dist[idx - w] + 1);
      if (x < w - 1 && y > 0) d = Math.min(d, dist[idx - w + 1] + 1.4142);

      dist[idx] = d;
    }
  }

  // Backward pass
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const idx = y * w + x;
      let d = dist[idx];
      if (d === 0) continue;

      if (x < w - 1) d = Math.min(d, dist[idx + 1] + 1);
      if (x < w - 1 && y < h - 1) d = Math.min(d, dist[idx + w + 1] + 1.4142);
      if (y < h - 1) d = Math.min(d, dist[idx + w] + 1);
      if (x > 0 && y < h - 1) d = Math.min(d, dist[idx + w - 1] + 1.4142);

      dist[idx] = d;
    }
  }

  // Create resulting image data
  const resImgData = ctxRes.createImageData(w, h);
  const resData = resImgData.data;

  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const d = dist[i];

    // Compute border alpha based on distance
    let borderAlpha = 0;
    if (d <= thickness - 0.5) {
      borderAlpha = 1.0;
    } else if (d <= thickness + 0.5) {
      borderAlpha = 1.0 - (d - (thickness - 0.5));
    }

    const origR = data[idx];
    const origG = data[idx + 1];
    const origB = data[idx + 2];
    const origA = data[idx + 3] / 255; // Normalize to [0, 1]

    // Blend source (original image) over destination (border color)
    const outA = origA + borderAlpha * (1.0 - origA);
    if (outA > 0) {
      resData[idx] = Math.round((origR * origA + borderR * borderAlpha * (1.0 - origA)) / outA);
      resData[idx + 1] = Math.round((origG * origA + borderG * borderAlpha * (1.0 - origA)) / outA);
      resData[idx + 2] = Math.round((origB * origA + borderB * borderAlpha * (1.0 - origA)) / outA);
      resData[idx + 3] = Math.round(outA * 255);
    } else {
      resData[idx] = 0;
      resData[idx + 1] = 0;
      resData[idx + 2] = 0;
      resData[idx + 3] = 0;
    }
  }

  ctxRes.putImageData(resImgData, 0, 0);
}

// Download image
saveBtn.addEventListener("click", () => {
  if (!activeImage) return;
  const link = document.createElement("a");
  link.download = "bordered_image.png";
  link.href = resCanvas.toDataURL("image/png");
  link.click();
});

// Init presets on load
initPresets();
