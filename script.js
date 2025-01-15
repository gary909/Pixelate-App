const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelSizeInput = document.getElementById('pixelSize');
const greyscaleInput = document.getElementById('greyscale');
const downloadButton = document.getElementById('downloadButton');

let img = new Image();

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
  canvas.width = img.width;
  canvas.height = img.height;
  drawPixelatedImage();
};

pixelSizeInput.addEventListener('input', drawPixelatedImage);
greyscaleInput.addEventListener('change', drawPixelatedImage);

function drawPixelatedImage() {
  const pixelSize = parseInt(pixelSizeInput.value, 10);
  const greyscale = greyscaleInput.checked;
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = img.width / pixelSize;
  tempCanvas.height = img.height / pixelSize;

  // Draw a smaller version of the image
  tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

  if (greyscale) {
    // Apply greyscale to the smaller image
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i] = avg;        // Red
      imageData.data[i + 1] = avg;    // Green
      imageData.data[i + 2] = avg;    // Blue
    }
    tempCtx.putImageData(imageData, 0, 0);
  }

  // Scale it back up to pixelate
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
}

downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'pixelated-image.png';
  link.href = canvas.toDataURL();
  link.click();
});
