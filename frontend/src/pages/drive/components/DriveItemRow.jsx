import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MdFolder,
  MdInsertDriveFile,
  MdEdit,
  MdDriveFileMove,
  MdDownload,
  MdDelete,
  MdCheck,
  MdClose,
} from "react-icons/md";
import { formatSize } from "../utils";

const itemSchema = z.object({
  name: z.string().min(3, "Name is required min 3 characters").max(100, "Name must be less than 100 characters").trim(),
});

const DriveItemRow = ({
  item,
  isRenaming,
  itemCount,
  onRenameStart,
  onRenameCancel,
  onRenameSubmit,
  onMoveClick,
  onDelete,
  onItemClick,
  onDownload,
  onFolderDrop,   // called with (folderId, dataTransfer) when dropped onto a folder row
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dragCounterRef = React.useRef(0);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: item.name },
  });

  useEffect(() => {
    if (isRenaming) {
      setValue("name", item.name);
    }
  }, [isRenaming, item.name, setValue]);

  const handleFormSubmit = (data) => {
    onRenameSubmit(item._id, data.name);
  };

  // ── Per-folder drop handlers ─────────────────────────────────────────────────
  const handleDragEnter = (e) => {
    if (item.type !== "folder") return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (item.type !== "folder") return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    if (item.type !== "folder") return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    if (item.type !== "folder") return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    onFolderDrop?.(item._id, e.dataTransfer);
  };

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-4 py-3 items-center border-b transition cursor-pointer group relative
        ${
          isDragOver && item.type === "folder"
            ? "bg-blue-50 border-l-4 border-l-blue-400"
            : "hover:bg-gray-50"
        }`}
      onClick={() => {
        if (isRenaming) return;
        onItemClick(item);
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      title={item.type === "folder" ? `Drop a folder here to upload into "${item.name}"` : undefined}
    >
      {/* Drop-over label */}
      {isDragOver && item.type === "folder" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-100 bg-opacity-70 pointer-events-none">
          <span className="text-xs font-bold text-blue-700">Drop into "{item.name}"</span>
        </div>
      )}
      {/* Name */}
      <div className="col-span-6 flex items-center gap-3">
        {item.type === "folder" ? (
          <MdFolder size={24} className="text-blue-400 flex-shrink-0" />
        ) : (
          <MdInsertDriveFile size={24} className="text-gray-400 flex-shrink-0" />
        )}
        {isRenaming ? (
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              <input
                type="text"
                {...register("name")}
                className={`flex-1 px-2 py-1 border rounded text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : ""
                }`}
                autoFocus
              />
              <button type="submit" className="text-green-600">
                <MdCheck size={18} />
              </button>
              <button type="button" onClick={onRenameCancel} className="text-gray-400">
                <MdClose size={18} />
              </button>
            </div>
            {errors.name && (
              <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>
            )}
          </form>
        ) : (
          <span className="text-sm text-gray-800 truncate" title={item.name}>
            {item.name}
          </span>
        )}
      </div>

      {/* Type */}
      <div className="col-span-2 text-sm text-gray-500 capitalize">{item.type}</div>

      {/* Size / Item Count */}
      <div className="col-span-2 text-sm text-gray-500">
        {item.type === "file" ? formatSize(item.size) : `${itemCount} items`}
      </div>

      {/* Actions */}
      <div
        className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {!isRenaming && (
          <>
            <button
              onClick={() => onRenameStart(item)}
              className="p-1 rounded hover:bg-blue-50 text-blue-500"
              title="Rename"
            >
              <MdEdit size={18} />
            </button>
            <button
              onClick={() => onMoveClick(item)}
              className="p-1 rounded hover:bg-yellow-50 text-yellow-600"
              title="Move"
            >
              <MdDriveFileMove size={18} />
            </button>
            {item.type === "file" && (
              <button
                onClick={() => onDownload(item)}
                className="p-1 rounded hover:bg-green-50 text-green-600"
                title="Download"
              >
                <MdDownload size={18} />
              </button>
            )}
            <button
              onClick={() => onDelete(item._id)}
              className="p-1 rounded hover:bg-red-50 text-red-500"
              title="Delete"
            >
              <MdDelete size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DriveItemRow;
