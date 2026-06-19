import React from "react";
import { MdClose } from "react-icons/md";

const ImagePreviewModal = ({ previewImage, onClose }) => {
  if (!previewImage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative bg-white rounded-lg p-2 max-w-[600px] max-h-[600px] w-full h-full flex flex-col shadow-2xl">
        <button
          onClick={onClose}
          className="absolute -top-5 -right-5 text-white hover:text-gray-300 transition bg-black bg-opacity-50 rounded-full p-2"
        >
          <MdClose size={24} />
        </button>
        <div className="flex-1 overflow-hidden flex justify-center items-center bg-gray-100 rounded">
          <img
            src={previewImage.url}
            alt={previewImage.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <p className="text-gray-800 text-center mt-2 font-medium truncate px-2">
          {previewImage.name}
        </p>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
