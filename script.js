const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelSizeInput = document.getElementById('pixelSize');
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

function drawPixelatedImage() {
  const pixelSize = parseInt(pixelSizeInput.value, 10);
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = img.width / pixelSize;
  tempCanvas.height = img.height / pixelSize;

  // Draw a smaller version of the image
  tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

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
