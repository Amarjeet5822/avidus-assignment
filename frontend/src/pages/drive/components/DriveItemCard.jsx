import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MdFolder,
  MdMoreVert,
  MdEdit,
  MdDriveFileMove,
  MdDownload,
  MdDelete,
  MdCheck,
  MdClose,
} from "react-icons/md";
import { getFileIcon, formatSize } from "../utils";

const itemSchema = z.object({
  name: z.string().min(3, "Name is required min 3 characters").max(100, "Name must be less than 100 characters").trim(),
});

const DriveItemCard = ({
  item,
  isRenaming,
  isMenuOpen,
  onMenuToggle,
  onRenameStart,
  onRenameCancel,
  onRenameSubmit,
  onMoveClick,
  onDelete,
  onItemClick,
  onDownload,
  onFolderDrop,   // called with (folderId) when something is dropped onto a folder card
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

  // Keep form value in sync when rename starts
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
    e.preventDefault(); // allow drop
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
      className={`relative bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition cursor-pointer group flex flex-col
        ${
          isDragOver && item.type === "folder"
            ? "border-blue-400 ring-2 ring-blue-300 bg-blue-50 shadow-md"
            : "border-gray-200 hover:border-blue-300"
        }`}
      onClick={() => {
        if (isRenaming) return;
        onItemClick(item);
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop-over label for folders */}
      {isDragOver && item.type === "folder" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-blue-100 bg-opacity-80 pointer-events-none">
          <span className="text-xs font-bold text-blue-600">Drop into "{item.name}"</span>
        </div>
      )}
      {/* Menu Button */}
      {!isRenaming && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(isMenuOpen ? null : item._id);
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition z-10"
        >
          <MdMoreVert size={20} />
        </button>
      )}

      {/* Context Menu */}
      {isMenuOpen && (
        <div
          className="absolute top-8 right-2 bg-white border rounded-lg shadow-lg z-20 py-1 min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onRenameStart(item)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <MdEdit size={16} /> Rename
          </button>
          <button
            onClick={() => onMoveClick(item)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <MdDriveFileMove size={16} /> Move
          </button>
          {item.type === "file" && (
            <button
              onClick={() => onDownload(item)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <MdDownload size={16} /> Download
            </button>
          )}
          <button
            onClick={() => onDelete(item._id)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <MdDelete size={16} /> Delete
          </button>
        </div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-3">
        {item.type === "folder" ? (
          <MdFolder size={48} className="text-blue-400" />
        ) : item.type === "file" && item.mimeType?.startsWith("image/") && item.s3_url ? (
          <img src={item.s3_url} alt={item.name} className="w-16 h-16 object-cover rounded shadow-sm" />
        ) : (
          <span className="text-4xl">{getFileIcon(item.mimeType)}</span>
        )}
      </div>

      {/* Name / Rename Form */}
      {isRenaming ? (
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <input
              type="text"
              {...register("name")}
              className={`flex-1 px-2 py-1 border rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              autoFocus
            />
            <button type="submit" className="text-green-600">
              <MdCheck size={16} />
            </button>
            <button type="button" onClick={onRenameCancel} className="text-gray-400">
              <MdClose size={16} />
            </button>
          </div>
          {errors.name && (
            <span className="text-[10px] text-red-500 mt-1">
              {errors.name.message}
            </span>
          )}
        </form>
      ) : (
        <p className="text-sm text-center text-gray-700 truncate font-medium" title={item.name}>
          {item.name}
        </p>
      )}

      {item.type === "file" && !isRenaming && (
        <p className="text-xs text-center text-gray-400 mt-1">{formatSize(item.size)}</p>
      )}
    </div>
  );
};

export default DriveItemCard;
