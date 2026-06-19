import React from "react";
import DriveItemCard from "./DriveItemCard";

const DriveGridView = ({
  folders,
  files,
  renamingId,
  menuOpen,
  onMenuToggle,
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...folders, ...files].map((item) => (
        <DriveItemCard
          key={item._id}
          item={item}
          isRenaming={renamingId === item._id}
          isMenuOpen={menuOpen === item._id}
          onMenuToggle={onMenuToggle}
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

export default DriveGridView;
