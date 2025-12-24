import { useState, useCallback, useMemo } from "react";
import Cropper from "react-easy-crop";

/* ================= HELPER ================= */
const getCroppedImg = (imageSrc, croppedAreaPixels, rotation = 0) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const radians = (rotation * Math.PI) / 180;

      // calculate bounding box of rotated image
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const width = image.width * cos + image.height * sin;
      const height = image.width * sin + image.height * cos;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // move context to crop area center
      ctx.translate(
        canvas.width / 2 - croppedAreaPixels.x,
        canvas.height / 2 - croppedAreaPixels.y
      );

      // rotate
      ctx.rotate(radians);

      // draw image centered
      ctx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2
      );

      ctx.rotate(-radians);

      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.95
      );
    };
  });
};

export default function ImageCrop({ file, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const imageSrc = useMemo(() => URL.createObjectURL(file), [file]);

  const onComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const rotateLeft = () => setRotation(r => (r - 90) % 360);
  const rotateRight = () => setRotation(r => (r + 90) % 360);

  const save = async () => {
    if (!croppedAreaPixels) return alert("Crop image first");
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
    onCropComplete(blob);
  };

  return (
    <div className="w-full">
      {/* Crop Area */}
      <div className="relative w-full h-80 bg-black rounded overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}         // ✅ rotation support
          aspect={1}
          objectFit="cover"
          restrictPosition={true}
          zoomSpeed={0.05}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onComplete}
        />
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-3">
        {/* Zoom */}
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(+e.target.value)}
          className="w-full"
        />

        {/* Rotate Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={rotateLeft}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            ⟲ Rotate Left
          </button>

          <button
            onClick={rotateRight}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            ⟳ Rotate Right
          </button>

          <button
            onClick={save}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
