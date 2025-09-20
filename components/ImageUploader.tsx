import React, { useCallback, useRef } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, TrashIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  image: ImageFile | null;
  onImageUpload: (file: ImageFile | null) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, image, onImageUpload, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          file: file,
          previewUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if(disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          file: file,
          previewUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, disabled]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const stepNumber = title.includes("First") ? 1 : 2;

  return (
    <div className="bg-brand-light-dark p-6 rounded-2xl shadow-lg flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white">{stepNumber}. Upload {title}</h2>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative aspect-square w-full border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center text-center text-gray-400 cursor-pointer hover:border-brand-blue hover:bg-brand-gray transition-all duration-300 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        {image ? (
          <>
            <img src={image.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            {!disabled && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <UploadIcon className="w-10 h-10" />
            <span className="font-semibold text-gray-300">Click to upload</span>
            <span className="text-sm">or drag and drop</span>
          </div>
        )}
      </label>
    </div>
  );
};
