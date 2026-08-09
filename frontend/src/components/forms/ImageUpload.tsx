import React, { useCallback } from 'react';

interface ImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ files, onChange, maxFiles = 3 }) => {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      
      const newFiles = [...files, ...validFiles].slice(0, maxFiles);
      onChange(newFiles);
    },
    [files, maxFiles, onChange]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour sélectionner</span> ou glissez-déposez</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG ou GIF (Max: {maxFiles} images)</p>
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileChange}
            disabled={files.length >= maxFiles}
          />
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`preview-${index}`} 
                className="object-cover w-full h-24 rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
