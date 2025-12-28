import { useState, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

/* ===== Helper to crop image ===== */
const getCroppedImage = (image, crop) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

/* ===== Crop Component ===== */
export default function ImageCrop({ file, onCropComplete, onCancel }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "px",
    x: 50,
    y: 50,
    width: 300,
    height: 300,
  });
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (file) setImageUrl(URL.createObjectURL(file));
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [file]);

  const save = async () => {
    if (!imgRef.current) return alert("Adjust crop first");
    const blob = await getCroppedImage(imgRef.current, crop);
    onCropComplete(blob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2">
      <div className="bg-white w-full h-full max-w-md rounded-lg flex flex-col overflow-hidden">

        {/* Crop Area */}
        <div className="flex-1 w-full flex items-center justify-center">
          {imageUrl && (
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              keepSelection
              ruleOfThirds
              style={{ width: "100%", height: "100%" }}
              minWidth={50}
              minHeight={50}
              circularCrop={false} // remove if square crop
              className="w-full h-full"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop"
                className="w-full h-full object-contain"
              />
            </ReactCrop>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between gap-4 p-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
