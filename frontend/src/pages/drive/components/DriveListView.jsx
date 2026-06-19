import React from "react";
import DriveItemRow from "./DriveItemRow";

const DriveListView = ({
  folders,
  files,
  items,
  renamingId,
  onRenameStart,
  onRenameCancel,
  onRenameSubmit,
  onMoveClick,
  onDelete,
  onItemClick,
  onDownload,
  onFolderDrop,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {[...folders, ...files].map((item) => (
        <DriveItemRow
          key={item._id}
          item={item}
          isRenaming={renamingId === item._id}
          itemCount={items.filter((i) => i.parentId === item._id).length}
          onRenameStart={onRenameStart}
          onRenameCancel={onRenameCancel}
          onRenameSubmit={onRenameSubmit}
          onMoveClick={onMoveClick}
          onDelete={onDelete}
          onItemClick={onItemClick}
          onDownload={onDownload}
          onFolderDrop={onFolderDrop}
        />
      ))}
    </div>
  );
};

export default DriveListView;
