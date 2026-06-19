import React, { useRef } from "react";
import { MdUploadFile, MdDriveFolderUpload } from "react-icons/md";

const UploadZone = ({ onFilesSelected, onFolderSelected, disabled }) => {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFilesSelected(files);
    e.target.value = "";
  };

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFolderSelected(files);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2 border border-dashed border-gray-200 rounded-lg px-3 py-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MdUploadFile size={16} />
        Upload Files
      </button>

      <span className="text-gray-200">|</span>

      <button
        onClick={() => folderInputRef.current?.click()}
        disabled={disabled}
        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MdDriveFolderUpload size={16} />
        Upload Folder
      </button>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderChange}
      />
    </div>
  );
};

export default UploadZone;
