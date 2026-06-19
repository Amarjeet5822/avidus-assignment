import React, { useRef } from "react";
import { MdViewList, MdGridView, MdCreateNewFolder, MdUploadFile, MdFolderOpen } from "react-icons/md";

const DriveHeader = ({
  viewMode,
  onToggleViewMode,
  onNewFolderClick,
  onUpload,
  uploading,
  folderUploading,
  folderUploadProgress, // { done: number, total: number }
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Drive</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleViewMode}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 transition"
            title={viewMode === "grid" ? "Switch to list" : "Switch to grid"}
          >
            {viewMode === "grid" ? <MdViewList size={24} /> : <MdGridView size={24} />}
          </button>
          <button
            onClick={onNewFolderClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold shadow-md transition"
          >
            <MdCreateNewFolder size={20} /> New Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || folderUploading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold shadow-md transition disabled:opacity-50"
          >
            <MdUploadFile size={20} /> {uploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Folder Upload Progress Banner */}
      {folderUploading && folderUploadProgress && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <MdFolderOpen size={20} className="text-blue-500 animate-pulse" />
          <div className="flex-1">
            <div className="flex justify-between text-sm font-medium text-blue-700 mb-1">
              <span>Uploading folder structure...</span>
              <span>{folderUploadProgress.done} / {folderUploadProgress.total}</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((folderUploadProgress.done / folderUploadProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveHeader;
