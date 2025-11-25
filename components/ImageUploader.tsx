import React, { useState } from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  image: ImageFile | null;
  onImageUpload: (image: ImageFile) => void;
  onClear: () => void;
  label: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageUpload, onClear, label }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      readImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readImageFile(file);
    }
  };

  const readImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const imageData: ImageFile = {
          name: file.name,
          dataURL: event.target.result,
          mimeType: file.type,
        };
        onImageUpload(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-gray-300 text-sm font-semibold">{label}</label>
      <div
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg min-h-[120px] transition-colors
          ${dragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 bg-gray-700/50 hover:border-blue-500'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {image ? (
          <div className="relative w-full h-auto max-h-48 flex items-center justify-center">
            <img src={image.dataURL} alt="Uploaded" className="max-w-full max-h-full object-contain rounded-md" />
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClear(); }}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow-md"
              title="Clear Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-1 text-sm">Drag & drop or click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;