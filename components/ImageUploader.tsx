
import React, { useRef } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
    type: 'face' | 'style';
    imageFile: ImageFile | null;
    onUpload: (file: File, type: 'face' | 'style') => void;
    onRemove: (type: 'face' | 'style') => void;
    uploadPrompt: string;
}

const UploadIcon: React.FC = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ type, imageFile, onUpload, onRemove, uploadPrompt }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file, type);
        }
    };

    const handleRemoveClick = () => {
        onRemove(type);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 bg-orange-50/50 rounded-lg">
            {imageFile ? (
                <div className="flex items-center space-x-4 p-2 border border-orange-200/50 rounded-lg bg-white">
                    <img src={imageFile.previewUrl} alt={`${type} Preview`} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-700 break-all">{imageFile.name}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={() => inputRef.current?.click()} className="text-sm bg-orange-100 text-orange-800 hover:bg-orange-200 font-semibold py-1 px-3 rounded-lg">
                            Ganti Foto
                        </button>
                        <button onClick={handleRemoveClick} className="p-1 text-red-500 hover:text-red-700 font-bold text-xl">
                            &times;
                        </button>
                    </div>
                </div>
            ) : (
                <label htmlFor={`${type}-upload`} className="flex justify-center w-full px-6 py-5 border-2 border-orange-200 border-dashed rounded-md cursor-pointer hover:border-orange-400">
                    <div className="text-center">
                        <UploadIcon />
                        <p className="mt-2 text-sm text-gray-500">{uploadPrompt}</p>
                    </div>
                </label>
            )}
            <input
                type="file"
                id={`${type}-upload`}
                ref={inputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageUploader;
