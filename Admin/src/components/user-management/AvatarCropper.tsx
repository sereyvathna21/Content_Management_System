"use client";
import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Cropper from "react-easy-crop";

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (croppedDataUrl: string) => void;
}

function getCroppedImg(imageSrc: string, crop: { x: number; y: number }, zoom: number, croppedAreaPixels: { width: number; height: number; x: number; y: number }) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      resolve(dataUrl);
    };
    image.onerror = (err) => reject(err);
    image.src = imageSrc;
  });
}

export default function AvatarCropper({ imageSrc, onCancel, onComplete }: Props) {
  const t = useTranslations();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixelsArg: any) => {
    setCroppedAreaPixels(croppedAreaPixelsArg);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    try {
      const dataUrl = await getCroppedImg(imageSrc, crop, zoom, croppedAreaPixels);
      onComplete(dataUrl);
    } catch (err) {
      console.error("Crop failed", err);
    }
  };

  return (
    <div className="w-full">
      <div className="relative h-72 bg-gray-100">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="flex items-center gap-3 mt-3">
        <input
          className="w-full"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>

      <div className="flex justify-end gap-3 mt-3">
        <button type="button" className="px-3 py-1 rounded-md border" onClick={onCancel}>
          {t("UserForm.cancel")}
        </button>
        <button type="button" className="px-3 py-1 rounded-md bg-primary text-white" onClick={handleCrop}>
          {t("UserForm.crop")}
        </button>
      </div>
    </div>
  );
}
