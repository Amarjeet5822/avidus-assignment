import React from "react";

const MoveBanner = ({ movingItem, folderId, onMove, onCancel }) => {
  return (
    <div className="mb-4 flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-300">
      <span className="text-sm text-yellow-800">
        Moving <strong>{movingItem.name}</strong> — click a folder to move into, or:
      </span>
      <div className="flex gap-2">
        {folderId && (
          <button
            onClick={() => onMove(folderId)}
            className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Move Here
          </button>
        )}
        <button
          onClick={() => onMove(null)}
          className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Move to Root
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MoveBanner;
