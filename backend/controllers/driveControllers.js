import DriveItem from "../models/driveItem.models.js";
import AppError from "../utils/AppError.js";
import { getPresignedUploadUrl, getPresignedUrl, deleteFromS3 } from "../config/s3.config.js";

// Create a folder
export const createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const { userId, role } = req.user;

    if (!name) {
      return next(new AppError(400, "Folder name is required"));
    }

    // If parentId is provided, verify it exists and user has access
    if (parentId) {
      const parent = await DriveItem.findOne({ _id: parentId, type: "folder", deletedAt: null });
      if (!parent) {
        return next(new AppError(404, "Parent folder not found"));
      }
      if (role !== "Admin" && parent.userId.toString() !== userId) {
        return next(new AppError(403, "Not authorized"));
      }
    }

    const folder = new DriveItem({
      userId,
      parentId: parentId || null,
      name,
      type: "folder",
    });

    await folder.save();
    res.status(201).json({ message: "Folder created", item: folder });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Init file upload — returns presigned PUT URL
export const initUpload = async (req, res, next) => {
  try {
    const { name, parentId, mimeType, size } = req.body;
    const { userId, role } = req.user;

    if (!name || !mimeType || !size) {
      return next(new AppError(400, "name, mimeType, and size are required"));
    }

    // Verify parent folder
    if (parentId) {
      const parent = await DriveItem.findOne({ _id: parentId, type: "folder", deletedAt: null });
      if (!parent) {
        return next(new AppError(404, "Parent folder not found"));
      }
      if (role !== "Admin" && parent.userId.toString() !== userId) {
        return next(new AppError(403, "Not authorized"));
      }
    }

    const extension = name.split(".").pop().toLowerCase();
    const timestamp = Date.now();
    const s3Key = `drive/${userId}/${parentId || "root"}/${timestamp}_${name}`;
    const s3_url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const driveItem = new DriveItem({
      userId,
      parentId: parentId || null,
      name,
      type: "file",
      key: s3Key,
      s3_url,
      mimeType,
      extension,
      size,
    });

    await driveItem.save();

    const presignedUrl = await getPresignedUploadUrl(s3Key, mimeType);

    res.status(201).json({ message: "Upload initialized", item: driveItem, presignedUrl });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Get contents at a level
export const getContents = async (req, res, next) => {
  try {
    const { parentId } = req.query;
    const { userId, role } = req.user;

    const filter = {
      parentId: parentId || null,
      deletedAt: null,
    };

    // Regular users see only their own items
    if (role !== "Admin") {
      filter.userId = userId;
    }

    const items = await DriveItem.find(filter)
      .sort({ type: 1, updatedAt: -1 }) // folders first, then by recent
      .select("-__v");

    res.status(200).json(items);
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Get presigned download URL
export const getDownloadUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const item = await DriveItem.findOne({ _id: id, type: "file", deletedAt: null });
    if (!item) {
      return next(new AppError(404, "File not found"));
    }

    if (role !== "Admin" && item.userId.toString() !== userId) {
      return next(new AppError(403, "Not authorized"));
    }

    const url = await getPresignedUrl(item.key);
    res.status(200).json({ url, name: item.name });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Rename a folder or file
export const rename = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { userId, role } = req.user;

    if (!name) {
      return next(new AppError(400, "Name is required"));
    }

    const item = await DriveItem.findOne({ _id: id, deletedAt: null });
    if (!item) {
      return next(new AppError(404, "Item not found"));
    }

    if (role !== "Admin" && item.userId.toString() !== userId) {
      return next(new AppError(403, "Not authorized"));
    }

    item.name = name;
    await item.save();

    res.status(200).json({ message: "Renamed successfully", item });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Move item to a different parent folder
export const moveItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parentId } = req.body; // null for root
    const { userId, role } = req.user;

    const item = await DriveItem.findOne({ _id: id, deletedAt: null });
    if (!item) {
      return next(new AppError(404, "Item not found"));
    }

    if (role !== "Admin" && item.userId.toString() !== userId) {
      return next(new AppError(403, "Not authorized"));
    }

    // Prevent moving a folder into itself or its own children
    if (item.type === "folder" && parentId) {
      if (item._id.toString() === parentId) {
        return next(new AppError(400, "Cannot move a folder into itself"));
      }
      // Check if target is a descendant
      let current = parentId;
      while (current) {
        if (current === item._id.toString()) {
          return next(new AppError(400, "Cannot move a folder into its own subfolder"));
        }
        const parent = await DriveItem.findById(current);
        current = parent?.parentId?.toString() || null;
      }
    }

    // Verify target parent exists
    if (parentId) {
      const target = await DriveItem.findOne({ _id: parentId, type: "folder", deletedAt: null });
      if (!target) {
        return next(new AppError(404, "Target folder not found"));
      }
    }

    item.parentId = parentId || null;
    await item.save();

    res.status(200).json({ message: "Moved successfully", item });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Soft delete (recursive for folders)
export const softDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const item = await DriveItem.findOne({ _id: id, deletedAt: null });
    if (!item) {
      return next(new AppError(404, "Item not found"));
    }

    if (role !== "Admin" && item.userId.toString() !== userId) {
      return next(new AppError(403, "Not authorized"));
    }

    const now = new Date();

    if (item.type === "folder") {
      // Recursively soft-delete all children
      await softDeleteChildren(item._id, now);
    }

    item.deletedAt = now;
    await item.save();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

// Helper: recursively soft-delete all children of a folder
async function softDeleteChildren(parentId, deletedAt) {
  const children = await DriveItem.find({ parentId, deletedAt: null });

  for (const child of children) {
    if (child.type === "folder") {
      await softDeleteChildren(child._id, deletedAt);
    }
    child.deletedAt = deletedAt;
    await child.save();
  }
}
