import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
  api_key: process.env['CLOUDINARY_API_KEY'],
  api_secret: process.env['CLOUDINARY_API_SECRET'],
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

// ─── Internal helper ─────────────────────────────────────────────────────────

function uploadFromBuffer(
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function uploadProductImage(
  buffer: Buffer,
  options?: { filename?: string },
): Promise<CloudinaryUploadResult> {
  return uploadFromBuffer(buffer, {
    folder: 'superstore/products',
    transformation: [
      { quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' },
    ],
    ...(options?.filename && {
      public_id: options.filename,
      use_filename: true,
    }),
    unique_filename: true,
  });
}

export async function uploadCategoryImage(
  buffer: Buffer,
): Promise<CloudinaryUploadResult> {
  return uploadFromBuffer(buffer, {
    folder: 'superstore/categories',
    transformation: [
      { quality: 'auto', fetch_format: 'auto', width: 800, crop: 'limit' },
    ],
    unique_filename: true,
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function generateThumbnailUrl(publicId: string, width: number): string {
  return cloudinary.url(publicId, {
    transformation: [{ width, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
    secure: true,
  });
}

export { cloudinary };
