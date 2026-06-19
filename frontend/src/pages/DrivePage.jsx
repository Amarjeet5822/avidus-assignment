import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  fetchContents,
  createFolder,
  initUpload,
  getDownloadUrl,
  renameItem,
  moveItem,
  deleteItem,
  setBreadcrumbs,
  toggleViewMode,
} from "../store/features/driveUser/driveUserSlice";
import {
  MdFolder,
  MdInsertDriveFile,
  MdDelete,
  MdEdit,
  MdCheck,
  MdClose,
  MdCreateNewFolder,
  MdUploadFile,
  MdGridView,
  MdViewList,
  MdDriveFileMove,
  MdDownload,
  MdMoreVert,
  MdHome,
  MdChevronRight,
} from "react-icons/md";
import toast from "react-hot-toast";
import axios from "axios";

// Zod schema for folder creation and renaming
const itemSchema = z.object({
  name: z.string().min(3, "Name is required min 3 characters").max(100, "Name must be less than 100 characters").trim(),
});

const DrivePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { folderId } = useParams();
  const { items, breadcrumbs, viewMode, loading } = useSelector((state) => state.driveUser);

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [movingItem, setMovingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Forms setup
  const {
    register: registerNewFolder,
    handleSubmit: handleNewFolderSubmit,
    reset: resetNewFolder,
    formState: { errors: newFolderErrors },
  } = useForm({
    resolver: zodResolver(itemSchema),
  });

  const {
    register: registerRename,
    handleSubmit: handleRenameSubmit,
    setValue: setRenameValueForm,
    formState: { errors: renameErrors },
  } = useForm({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    dispatch(fetchContents(folderId || null));
  }, [dispatch, folderId]);

  // Build breadcrumbs on navigation
  useEffect(() => {
    if (!folderId) {
      dispatch(setBreadcrumbs([]));
    }
  }, [folderId, dispatch]);

  const handleFolderClick = (folder) => {
    const newBreadcrumbs = [...breadcrumbs, { _id: folder._id, name: folder.name }];
    dispatch(setBreadcrumbs(newBreadcrumbs));
    navigate(`/drive/${folder._id}`);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      dispatch(setBreadcrumbs([]));
      navigate("/drive");
    } else {
      const crumb = breadcrumbs[index];
      dispatch(setBreadcrumbs(breadcrumbs.slice(0, index + 1)));
      navigate(`/drive/${crumb._id}`);
    }
  };

  const onNewFolderSubmit = (data) => {
    dispatch(createFolder({ name: data.name, parentId: folderId || null }))
      .unwrap()
      .then(() => {
        toast.success("Folder created");
        resetNewFolder();
        setShowNewFolder(false);
      })
      .catch((err) => toast.error(err.message || "Failed to create folder"));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await dispatch(
        initUpload({
          name: file.name,
          parentId: folderId || null,
          mimeType: file.type,
          size: file.size,
        })
      ).unwrap();

      // Upload directly to S3 using presigned URL
      await axios.put(result.presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      toast.success("File uploaded");
      dispatch(fetchContents(folderId || null));
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (item) => {
    try {
      const result = await dispatch(getDownloadUrl(item._id)).unwrap();
      const a = document.createElement("a");
      a.href = result.url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error(err.message || "Download failed");
    }
  };

  const handlePreview = (item) => {
    if (item.s3_url) {
      setPreviewImage({ url: item.s3_url, name: item.name });
    } else {
      toast.error("Image URL not available");
    }
  };

  const startRename = (item) => {
    setRenamingId(item._id);
    setRenameValueForm("name", item.name);
    setMenuOpen(null);
  };

  const onRenameSubmit = (data) => {
    if (!renamingId) return;
    dispatch(renameItem({ id: renamingId, name: data.name }))
      .unwrap()
      .then(() => {
        toast.success("Renamed");
        setRenamingId(null);
      })
      .catch((err) => toast.error(err.message || "Rename failed"));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    dispatch(deleteItem(id))
      .unwrap()
      .then(() => toast.success("Deleted"))
      .catch((err) => toast.error(err.message || "Delete failed"));
  };

  const handleMove = (targetFolderId) => {
    if (!movingItem) return;
    dispatch(moveItem({ id: movingItem._id, parentId: targetFolderId }))
      .unwrap()
      .then(() => {
        toast.success("Moved successfully");
        setMovingItem(null);
      })
      .catch((err) => toast.error(err.message || "Move failed"));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType?.includes("pdf")) return "📕";
    if (mimeType?.includes("word") || mimeType?.includes("document")) return "📘";
    if (mimeType?.includes("sheet") || mimeType?.includes("excel")) return "📗";
    return "📄";
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const folders = items.filter((i) => i.type === "folder");
  const files = items.filter((i) => i.type === "file");

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Drive</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleViewMode())}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 transition"
            title={viewMode === "grid" ? "Switch to list" : "Switch to grid"}
          >
            {viewMode === "grid" ? <MdViewList size={24} /> : <MdGridView size={24} />}
          </button>
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold shadow-md transition"
          >
            <MdCreateNewFolder size={20} /> New Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold shadow-md transition disabled:opacity-50"
          >
            <MdUploadFile size={20} /> {uploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 mb-6 text-sm bg-gray-50 p-3 rounded-lg">
        <button
          onClick={() => handleBreadcrumbClick(-1)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <MdHome size={18} /> Home
        </button>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb._id}>
            <MdChevronRight className="text-gray-400" size={18} />
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`font-medium transition ${index === breadcrumbs.length - 1
                ? "text-gray-800 cursor-default"
                : "text-blue-600 hover:text-blue-800"
                }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <form
          onSubmit={handleNewFolderSubmit(onNewFolderSubmit)}
          className="mb-6 flex flex-col gap-1 bg-blue-50 p-4 rounded-lg border border-blue-200"
        >
          <div className="flex items-center gap-3">
            <MdFolder size={24} className="text-blue-500" />
            <input
              type="text"
              placeholder="Folder name"
              {...registerNewFolder("name")}
              className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white ${newFolderErrors.name ? "border-red-500" : ""}`}
              autoFocus
            />
            <button type="submit" className="text-green-600 hover:text-green-800">
              <MdCheck size={24} />
            </button>
            <button type="button" onClick={() => { setShowNewFolder(false); resetNewFolder(); }} className="text-gray-500 hover:text-gray-700">
              <MdClose size={24} />
            </button>
          </div>
          {newFolderErrors.name && (
            <span className="text-xs text-red-500 ml-9">{newFolderErrors.name.message}</span>
          )}
        </form>
      )}

      {/* Move Banner */}
      {movingItem && (
        <div className="mb-4 flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-300">
          <span className="text-sm text-yellow-800">
            Moving <strong>{movingItem.name}</strong> — click a folder to move into, or:
          </span>
          <div className="flex gap-2">
            {folderId && (
              <button
                onClick={() => handleMove(folderId)}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Move Here
              </button>
            )}
            <button
              onClick={() => handleMove(null)}
              className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Move to Root
            </button>
            <button
              onClick={() => setMovingItem(null)}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-500 mb-4">Loading...</p>}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <MdFolder size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">This folder is empty</p>
          <p className="text-sm mt-1">Create a folder or upload a file to get started</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...folders, ...files].map((item) => (
            <div
              key={item._id}
              className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex flex-col"
              onClick={() => {
                if (renamingId === item._id) return; // Prevent clicks while renaming
                if (movingItem && item.type === "folder") {
                  handleMove(item._id);
                } else if (item.type === "folder") {
                  handleFolderClick(item);
                } else if (item.type === "file" && item.mimeType?.startsWith("image/")) {
                  handlePreview(item);
                } else {
                  handleDownload(item);
                }
              }}
            >
              {/* Menu Button */}
              {renamingId !== item._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === item._id ? null : item._id);
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <MdMoreVert size={20} />
                </button>
              )}

              {/* Context Menu */}
              {menuOpen === item._id && (
                <div
                  className="absolute top-8 right-2 bg-white border rounded-lg shadow-lg z-20 py-1 min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => startRename(item)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MdEdit size={16} /> Rename
                  </button>
                  <button
                    onClick={() => { setMovingItem(item); setMenuOpen(null); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MdDriveFileMove size={16} /> Move
                  </button>
                  {item.type === "file" && (
                    <button
                      onClick={() => { handleDownload(item); setMenuOpen(null); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MdDownload size={16} /> Download
                    </button>
                  )}
                  <button
                    onClick={() => { handleDelete(item._id); setMenuOpen(null); }}
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
              {renamingId === item._id ? (
                <form
                  onSubmit={handleRenameSubmit(onRenameSubmit)}
                  className="flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      {...registerRename("name")}
                      className={`flex-1 px-2 py-1 border rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${renameErrors.name ? "border-red-500" : ""}`}
                      autoFocus
                    />
                    <button type="submit" className="text-green-600"><MdCheck size={16} /></button>
                    <button type="button" onClick={() => setRenamingId(null)} className="text-gray-400"><MdClose size={16} /></button>
                  </div>
                  {renameErrors.name && (
                    <span className="text-[10px] text-red-500 mt-1">{renameErrors.name.message}</span>
                  )}
                </form>
              ) : (
                <p className="text-sm text-center text-gray-700 truncate font-medium" title={item.name}>{item.name}</p>
              )}

              {item.type === "file" && renamingId !== item._id && (
                <p className="text-xs text-center text-gray-400 mt-1">{formatSize(item.size)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && items.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {[...folders, ...files].map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b hover:bg-gray-50 transition cursor-pointer group relative"
              onClick={() => {
                if (renamingId === item._id) return;
                if (movingItem && item.type === "folder") {
                  handleMove(item._id);
                } else if (item.type === "folder") {
                  handleFolderClick(item);
                } else if (item.type === "file" && item.mimeType?.startsWith("image/")) {
                  handlePreview(item);
                } else {
                  handleDownload(item);
                }
              }}
            >
              {/* Name */}
              <div className="col-span-6 flex items-center gap-3">
                {item.type === "folder" ? (
                  <MdFolder size={24} className="text-blue-400 flex-shrink-0" />
                ) : (
                  <MdInsertDriveFile size={24} className="text-gray-400 flex-shrink-0" />
                )}
                {renamingId === item._id ? (
                  <form
                    onSubmit={handleRenameSubmit(onRenameSubmit)}
                    className="flex flex-col flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        {...registerRename("name")}
                        className={`flex-1 px-2 py-1 border rounded text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${renameErrors.name ? "border-red-500" : ""}`}
                        autoFocus
                      />
                      <button type="submit" className="text-green-600"><MdCheck size={18} /></button>
                      <button type="button" onClick={() => setRenamingId(null)} className="text-gray-400"><MdClose size={18} /></button>
                    </div>
                    {renameErrors.name && (
                      <span className="text-xs text-red-500 mt-1">{renameErrors.name.message}</span>
                    )}
                  </form>
                ) : (
                  <span className="text-sm text-gray-800 truncate" title={item.name}>{item.name}</span>
                )}
              </div>

              {/* Type */}
              <div className="col-span-2 text-sm text-gray-500 capitalize">{item.type}</div>

              {/* Size */}
              <div className="col-span-2 text-sm text-gray-500">
                {item.type === "file" ? formatSize(item.size) : `${items.filter(i => i.parentId === item._id).length} items`}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition z-10" onClick={(e) => e.stopPropagation()}>
                {renamingId !== item._id && (
                  <>
                    <button
                      onClick={() => startRename(item)}
                      className="p-1 rounded hover:bg-blue-50 text-blue-500"
                      title="Rename"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => setMovingItem(item)}
                      className="p-1 rounded hover:bg-yellow-50 text-yellow-600"
                      title="Move"
                    >
                      <MdDriveFileMove size={18} />
                    </button>
                    {item.type === "file" && (
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1 rounded hover:bg-green-50 text-green-600"
                        title="Download"
                      >
                        <MdDownload size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      title="Delete"
                    >
                      <MdDelete size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative bg-white rounded-lg p-2 max-w-[600px] max-h-[600px] w-full h-full flex flex-col shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
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
            <p className="text-gray-800 text-center mt-2 font-medium truncate px-2">{previewImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrivePage;
