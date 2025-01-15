const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelSizeInput = document.getElementById('pixelSize');
const greyscaleInput = document.getElementById('greyscale');
const maxWidthInput = document.getElementById('maxWidth');
const maxHeightInput = document.getElementById('maxHeight');
const usePaletteInput = document.getElementById('usePalette');
const paletteSelection = document.getElementById('paletteSelection');
const downloadButton = document.getElementById('downloadButton');

let img = new Image();

// Predefined color palettes
const colorPalettes = {
  gameboy: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
  atari2600: ['#000000', '#FFFFFF', '#F01800', '#F0CC00', '#0018F0', '#78F0CC'],
  nes: ['#7C7C7C', '#0000FC', '#940084', '#F80000', '#F8B800', '#00FC00', '#3CBCFC', '#FFFFFF'],
  commodore64: ['#000000', '#FFFFFF', '#68372B', '#70A4B2', '#6F3D86', '#588D43', '#352879', '#B8C76F']
};

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

img.onload = () => {
  handleCanvasResize();
  drawPixelatedImage();
};

pixelSizeInput.addEventListener('input', drawPixelatedImage);
greyscaleInput.addEventListener('change', drawPixelatedImage);
maxWidthInput.addEventListener('input', handleCanvasResize);
maxHeightInput.addEventListener('input', handleCanvasResize);
usePaletteInput.addEventListener('change', (event) => {
  paletteSelection.disabled = !event.target.checked;
  drawPixelatedImage();
});
paletteSelection.addEventListener('change', drawPixelatedImage);

function handleCanvasResize() {
  const maxWidth = parseInt(maxWidthInput.value, 10) || img.width;
  const maxHeight = parseInt(maxHeightInput.value, 10) || img.height;
  const aspectRatio = img.width / img.height;

  if (img.width > maxWidth) {
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
  } else if (img.height > maxHeight) {
    canvas.height = maxHeight;
    canvas.width = maxHeight * aspectRatio;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }
  drawPixelatedImage();
}

function drawPixelatedImage() {
  const pixelSize = parseInt(pixelSizeInput.value, 10);
  const greyscale = greyscaleInput.checked;
  const usePalette = usePaletteInput.checked;
  const selectedPalette = colorPalettes[paletteSelection.value];
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = canvas.width / pixelSize;
  tempCanvas.height = canvas.height / pixelSize;

  tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

  let imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  if (greyscale) {
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i] = avg;        // Red
      imageData.data[i + 1] = avg;    // Green
      imageData.data[i + 2] = avg;    // Blue
    }
  }

  if (usePalette) {
    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r, g, b] = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
      const nearestColor = getNearestColor([r, g, b], selectedPalette);
      imageData.data[i] = nearestColor[0];     // Red
      imageData.data[i + 1] = nearestColor[1]; // Green
      imageData.data[i + 2] = nearestColor[2]; // Blue
    }
  }

  tempCtx.putImageData(imageData, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
}

function getNearestColor(color, palette) {
  let nearest = palette[0];
  let minDistance = Infinity;

  for (const hex of palette) {
    const [pr, pg, pb] = hexToRgb(hex);
    const distance = Math.sqrt(
      Math.pow(color[0] - pr, 2) +
      Math.pow(color[1] - pg, 2) +
      Math.pow(color[2] - pb, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = hex;
    }
  }
  return hexToRgb(nearest);
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'pixelated-image.png';
  link.href = canvas.toDataURL();
  link.click();
});
