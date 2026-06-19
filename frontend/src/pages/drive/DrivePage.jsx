import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { MdFolder } from "react-icons/md";

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
} from "../../store/features/driveUser/driveUserSlice";

import DriveHeader from "./components/DriveHeader";
import DriveBreadcrumbs from "./components/DriveBreadcrumbs";
import NewFolderForm from "./components/NewFolderForm";
import MoveBanner from "./components/MoveBanner";
import DriveGridView from "./components/DriveGridView";
import DriveListView from "./components/DriveListView";
import ImagePreviewModal from "./components/ImagePreviewModal";
import DropZoneOverlay from "./components/DropZoneOverlay";
import UploadZone from "./components/UploadZone";
import {
  readDirectory,
  countNodes,
  uploadTree,
  buildTreeFromFileList,
  uploadTreeFromFileList,
} from "./utils/folderUploadUtils";

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
  const [isDragging, setIsDragging] = useState(false);
  const [folderUploading, setFolderUploading] = useState(false);
  const [folderUploadProgress, setFolderUploadProgress] = useState(null);
  const lastClickedRef = useRef({ id: null, time: 0 });
  // Track drag events to avoid flickering when moving over child elements
  const dragCounterRef = useRef(0);

  useEffect(() => {
    dispatch(fetchContents(folderId || null));
  }, [dispatch, folderId]);

  // Build breadcrumbs on navigation
  useEffect(() => {
    if (!folderId) {
      dispatch(setBreadcrumbs([]));
    }
  }, [folderId, dispatch]);

  // ─── Drag & Drop Handlers ────────────────────────────────────────────────────

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Required to allow drop
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const { items: dtItems } = e.dataTransfer;
    if (!dtItems || dtItems.length === 0) return;

    // Gather all folder entries from the drop
    const folderEntries = [];
    const looseFiles = [];

    for (const dtItem of dtItems) {
      // webkitGetAsEntry gives us full filesystem access
      const entry = dtItem.webkitGetAsEntry?.();
      if (!entry) continue;
      if (entry.isDirectory) {
        folderEntries.push(entry);
      } else if (entry.isFile) {
        looseFiles.push(entry);
      }
    }

    // Handle loose files as normal single-file uploads
    if (looseFiles.length > 0) {
      for (const fileEntry of looseFiles) {
        const file = await new Promise((res) => fileEntry.file(res));
        await handleFileUpload(file);
      }
    }

    // Handle folder(s) with recursive upload
    if (folderEntries.length > 0) {
      setFolderUploading(true);
      let totalNodes = 0;
      let doneNodes = 0;

      try {
        // Phase 1: Read all folder trees into memory to get the total count
        const trees = [];
        for (const entry of folderEntries) {
          const tree = await readDirectory(entry);
          trees.push(tree);
          totalNodes += countNodes(tree);
        }

        setFolderUploadProgress({ done: 0, total: totalNodes });

        // Phase 2: Upload each tree recursively
        for (const tree of trees) {
          await uploadTree(tree, folderId || null, dispatch, () => {
            doneNodes += 1;
            setFolderUploadProgress({ done: doneNodes, total: totalNodes });
          });
        }

        toast.success("Folder uploaded successfully!");
        dispatch(fetchContents(folderId || null));
      } catch (err) {
        toast.error(err.message || "Folder upload failed");
      } finally {
        setFolderUploading(false);
        setFolderUploadProgress(null);
      }
    }
  }, [folderId, dispatch]);

  // Called when a local folder/file is dropped directly onto a drive folder card
  const handleFolderCardDrop = useCallback(async (targetFolderId, dataTransfer) => {
    const { items: dtItems } = dataTransfer;
    if (!dtItems || dtItems.length === 0) return;

    const folderEntries = [];
    const looseFiles = [];

    for (const dtItem of dtItems) {
      const entry = dtItem.webkitGetAsEntry?.();
      if (!entry) continue;
      if (entry.isDirectory) folderEntries.push(entry);
      else if (entry.isFile) looseFiles.push(entry);
    }

    // Loose files go into the target folder
    if (looseFiles.length > 0) {
      for (const fileEntry of looseFiles) {
        const file = await new Promise((res) => fileEntry.file(res));
        setUploading(true);
        try {
          const result = await dispatch(
            initUpload({ name: file.name, parentId: targetFolderId, mimeType: file.type, size: file.size })
          ).unwrap();
          await import("axios").then(({ default: axios }) =>
            axios.put(result.presignedUrl, file, { headers: { "Content-Type": file.type } })
          );
        } finally {
          setUploading(false);
        }
      }
      dispatch(fetchContents(folderId || null));
    }

    // Folder entries: recursively upload into the target folder
    if (folderEntries.length > 0) {
      setFolderUploading(true);
      let totalNodes = 0;
      let doneNodes = 0;
      try {
        const trees = [];
        for (const entry of folderEntries) {
          const tree = await readDirectory(entry);
          trees.push(tree);
          totalNodes += countNodes(tree);
        }
        setFolderUploadProgress({ done: 0, total: totalNodes });
        for (const tree of trees) {
          await uploadTree(tree, targetFolderId, dispatch, () => {
            doneNodes += 1;
            setFolderUploadProgress({ done: doneNodes, total: totalNodes });
          });
        }
        toast.success("Folder uploaded successfully!");
        dispatch(fetchContents(folderId || null));
      } catch (err) {
        toast.error(err.message || "Folder upload failed");
      } finally {
        setFolderUploading(false);
        setFolderUploadProgress(null);
      }
    }
  }, [folderId, dispatch]);

  // ─── File Picker Handlers (UploadZone) ──────────────────────────────────────

  // Multiple individual files selected from OS picker
  const handlePickedFiles = async (files) => {
    for (const file of files) {
      await handleFileUpload(file);
    }
  };

  // A whole folder selected from OS folder picker (webkitdirectory)
  const handlePickedFolder = async (fileList) => {
    const trees = buildTreeFromFileList(fileList);
    if (trees.length === 0) return;

    setFolderUploading(true);
    const totalNodes = fileList.length + trees.length;
    let doneNodes = 0;
    setFolderUploadProgress({ done: 0, total: totalNodes });

    try {
      for (const tree of trees) {
        await uploadTreeFromFileList(tree, folderId || null, dispatch, () => {
          doneNodes += 1;
          setFolderUploadProgress({ done: doneNodes, total: totalNodes });
        });
      }
      toast.success("Folder uploaded successfully!");
      dispatch(fetchContents(folderId || null));
    } catch (err) {
      toast.error(err.message || "Folder upload failed");
    } finally {
      setFolderUploading(false);
      setFolderUploadProgress(null);
    }
  };

  // ─── Existing Handlers ────────────────────────────────────────────────────────


  const handleFolderClick = (folder) => {
    const now = Date.now();
    if (lastClickedRef.current.id === folder._id && now - lastClickedRef.current.time < 500) {
      return;
    }
    lastClickedRef.current = { id: folder._id, time: now };

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
        setShowNewFolder(false);
      })
      .catch((err) => toast.error(err.message || "Failed to create folder"));
  };

  const handleFileUpload = async (file) => {
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

      await axios.put(result.presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      toast.success("File uploaded");
      dispatch(fetchContents(folderId || null));
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
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
    setMenuOpen(null);
  };

  const onRenameSubmit = (id, newName) => {
    dispatch(renameItem({ id, name: newName }))
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

  const handleItemClick = (item) => {
    if (movingItem && item.type === "folder") {
      handleMove(item._id);
    } else if (item.type === "folder") {
      handleFolderClick(item);
    } else if (item.type === "file" && item.mimeType?.startsWith("image/")) {
      handlePreview(item);
    } else {
      handleDownload(item);
    }
  };

  const folders = items.filter((i) => i.type === "folder");
  const files = items.filter((i) => i.type === "file");

  return (
    <div
      className="container mx-auto p-4 max-w-5xl mt-8 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop Zone Visual Overlay */}
      <DropZoneOverlay isDragging={isDragging} />

      {/* Header */}
      <DriveHeader
        viewMode={viewMode}
        onToggleViewMode={() => dispatch(toggleViewMode())}
        onNewFolderClick={() => setShowNewFolder(true)}
        onUpload={handleFileUpload}
        uploading={uploading}
        folderUploading={folderUploading}
        folderUploadProgress={folderUploadProgress}
      />

      {/* Breadcrumbs */}
      <DriveBreadcrumbs
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {/* New Folder Input */}
      {showNewFolder && (
        <NewFolderForm
          onSubmit={onNewFolderSubmit}
          onCancel={() => setShowNewFolder(false)}
        />
      )}

      {/* Move Banner */}
      {movingItem && (
        <MoveBanner
          movingItem={movingItem}
          folderId={folderId}
          onMove={handleMove}
          onCancel={() => setMovingItem(null)}
        />
      )}

      {loading && <p className="text-gray-500 mb-4">Loading...</p>}

      {!loading && (
        <div className="mb-3">
          <UploadZone
            onFilesSelected={handlePickedFiles}
            onFolderSelected={handlePickedFolder}
            disabled={uploading || folderUploading}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl text-center py-20 text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-300 cursor-default"
        >
          <MdFolder size={64} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium text-gray-500">This folder is empty</p>
          <p className="text-sm mt-2 text-gray-400">
            Create a folder, upload a file, or
          </p>
          <p className="text-sm font-semibold text-blue-500 mt-1">
            📂 Drag &amp; drop a folder here to upload its entire structure
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && items.length > 0 && (
        <DriveGridView
          folders={folders}
          files={files}
          renamingId={renamingId}
          menuOpen={menuOpen}
          onMenuToggle={setMenuOpen}
          onRenameStart={startRename}
          onRenameCancel={() => setRenamingId(null)}
          onRenameSubmit={onRenameSubmit}
          onMoveClick={setMovingItem}
          onDelete={handleDelete}
          onItemClick={handleItemClick}
          onDownload={handleDownload}
          onFolderDrop={handleFolderCardDrop}
        />
      )}

      {/* List View */}
      {viewMode === "list" && items.length > 0 && (
        <DriveListView
          folders={folders}
          files={files}
          items={items}
          renamingId={renamingId}
          onRenameStart={startRename}
          onRenameCancel={() => setRenamingId(null)}
          onRenameSubmit={onRenameSubmit}
          onMoveClick={setMovingItem}
          onDelete={handleDelete}
          onItemClick={handleItemClick}
          onDownload={handleDownload}
          onFolderDrop={handleFolderCardDrop}
        />
      )}

      {/* Preview Modal */}
      <ImagePreviewModal
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />

    </div>
  );
};

export default DrivePage;
