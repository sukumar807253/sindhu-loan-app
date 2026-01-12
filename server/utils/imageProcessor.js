const sharp = require("sharp");

async function processImage(file) {
  const isPng = file.mimetype === "image/png";

  let image = sharp(file.buffer).rotate(); // auto orientation

  if (isPng) {
    // ✅ ZERO LOSS
    return await image.png({
      compressionLevel: 0,
      adaptiveFiltering: false,
    }).toBuffer();
  }

  // ✅ HIGH QUALITY JPEG (NO BLUR)
  return await image.jpeg({
    quality: 95,
    chromaSubsampling: "4:4:4",
    mozjpeg: true,
  }).toBuffer();
}

module.exports = processImage;
