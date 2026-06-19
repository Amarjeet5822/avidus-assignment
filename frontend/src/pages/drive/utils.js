export const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith("image/")) return "🖼️";
  if (mimeType?.includes("pdf")) return "📕";
  if (mimeType?.includes("word") || mimeType?.includes("document")) return "📘";
  if (mimeType?.includes("sheet") || mimeType?.includes("excel")) return "📗";
  return "📄";
};

export const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
