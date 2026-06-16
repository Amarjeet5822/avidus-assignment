import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (fileBuffer, fileName, mimetype) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  try {
    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

export const getPresignedUrl = async (fileName) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  try {
    // URL expires in 1 hour (3600 seconds)
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error(`Failed to generate download link: ${error.message}`);
  }
};

export const deleteFromS3 = async (fileName) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};
