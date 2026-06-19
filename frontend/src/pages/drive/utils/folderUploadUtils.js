import axios from "axios";
import { createFolder, initUpload } from "../../../store/features/driveUser/driveUserSlice";

/**
 * Recursively reads a FileSystemDirectoryEntry and returns a tree structure:
 * {
 *   name: string,
 *   isDirectory: boolean,
 *   entry: FileSystemEntry,        // for files: the raw entry
 *   children: [] | null            // for directories: array of child nodes
 * }
 *
 * Note: readEntries() only returns up to 100 entries at a time on some browsers,
 * so we loop until it returns an empty array to guarantee we read everything.
 */
export async function readDirectory(dirEntry) {
  const children = [];
  const reader = dirEntry.createReader();

  // Keep reading until no more entries are returned (handles >100 entries)
  await new Promise((resolve, reject) => {
    const readBatch = () => {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve();
          return;
        }
        for (const entry of entries) {
          if (entry.isDirectory) {
            const subtree = await readDirectory(entry);
            children.push(subtree);
          } else {
            children.push({ name: entry.name, isDirectory: false, entry, children: null });
          }
        }
        readBatch(); // continue reading next batch
      }, reject);
    };
    readBatch();
  });

  return { name: dirEntry.name, isDirectory: true, entry: dirEntry, children };
}

/**
 * Counts the total number of files and folders in a tree (for progress tracking).
 */
export function countNodes(node) {
  if (!node.isDirectory) return 1;
  let count = 1; // count the directory itself
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}

/**
 * Converts a FileSystemFileEntry into a File object via a Promise.
 */
function getFileFromEntry(entry) {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

/**
 * Recursively walks the tree structure built by readDirectory().
 * For each directory node: creates a folder via the backend API.
 * For each file node: calls initUpload for a presigned URL, then PUTs the file to S3.
 *
 * @param {Object}   node       - A node from readDirectory()
 * @param {string|null} parentId - The backend DB ID of the parent folder
 * @param {Function} dispatch   - Redux dispatch
 * @param {Function} onProgress - Called after each item is processed: (done, total)
 */
export async function uploadTree(node, parentId, dispatch, onProgress) {
  if (node.isDirectory) {
    // 1. Create the folder in the backend
    const result = await dispatch(
      createFolder({ name: node.name, parentId: parentId || null })
    ).unwrap();
    const newFolderId = result._id;

    onProgress(); // count this folder as done

    // 2. Recursively process all children
    for (const child of node.children) {
      await uploadTree(child, newFolderId, dispatch, onProgress);
    }
  } else {
    // 1. Get the actual File object
    const file = await getFileFromEntry(node.entry);

    // 2. Initialize upload to get presigned S3 URL
    const result = await dispatch(
      initUpload({
        name: file.name,
        parentId: parentId || null,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      })
    ).unwrap();

    // 3. Upload directly to S3
    await axios.put(result.presignedUrl, file, {
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });

    onProgress(); // count this file as done
  }
}
/**
 * Builds a tree structure from a flat FileList produced by an <input webkitdirectory>.
 * Each file has a `webkitRelativePath` like "FolderA/sub/file.txt".
 *
 * Returns an array of root-level tree nodes (same shape as readDirectory() output),
 * except file nodes carry `.file` (a File object) instead of `.entry`.
 */
export function buildTreeFromFileList(fileList) {
  const root = {}; // map of path -> node

  const getOrCreateDir = (pathParts) => {
    let current = root;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = { name: part, isDirectory: true, children: {}, file: null };
      }
      current = current[part].children;
    }
    return current;
  };

  for (const file of fileList) {
    const parts = file.webkitRelativePath.split("/");
    const fileName = parts.pop();
    const dirNode = getOrCreateDir(parts);
    dirNode[fileName] = { name: fileName, isDirectory: false, file, children: null };
  }

  // Recursively converts the nested map into an array-based tree
  const toTree = (map) =>
    Object.values(map).map((node) =>
      node.isDirectory
        ? { ...node, children: toTree(node.children) }
        : node
    );

  return toTree(root);
}

/**
 * Like uploadTree() but handles file-picker folder uploads.
 * File nodes carry `.file` (a File object) instead of a FileSystemEntry `.entry`.
 */
export async function uploadTreeFromFileList(node, parentId, dispatch, onProgress) {
  if (node.isDirectory) {
    const result = await dispatch(
      createFolder({ name: node.name, parentId: parentId || null })
    ).unwrap();
    const newFolderId = result._id;
    onProgress();
    for (const child of node.children) {
      await uploadTreeFromFileList(child, newFolderId, dispatch, onProgress);
    }
  } else {
    const file = node.file;
    const result = await dispatch(
      initUpload({
        name: file.name,
        parentId: parentId || null,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      })
    ).unwrap();
    await axios.put(result.presignedUrl, file, {
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    onProgress();
  }
}
