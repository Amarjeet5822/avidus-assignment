import React from "react";
import { MdDriveFolderUpload } from "react-icons/md";

/**
 * Full-page overlay that appears when a user drags something over the Drive page.
 * Gives a clear visual cue that the area is a valid drop target.
 */
const DropZoneOverlay = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-400 rounded-2xl m-4 transition-all" />

      {/* Label */}
      <div className="relative flex flex-col items-center gap-4 text-blue-600">
        <MdDriveFolderUpload size={80} className="drop-shadow-lg animate-bounce" />
        <div className="bg-white bg-opacity-90 rounded-xl px-8 py-4 shadow-xl text-center">
          <p className="text-2xl font-bold text-blue-700">Drop folder here</p>
          <p className="text-sm text-blue-500 mt-1">The entire folder structure will be recreated</p>
        </div>
      </div>
    </div>
  );
};

export default DropZoneOverlay;
