import multer from 'multer';

export const createMemoryUpload = (sizeLimitBytes) => {
    const storage = multer.memoryStorage();

    return multer({
        storage: storage,
        limits: {
            fileSize: sizeLimitBytes
        }
    })
}
export const uploadTaskImage = createMemoryUpload(10 * 1024 * 1024);