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

function uploadRaw(
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
      resolve(result);
    });
    stream.end(buffer);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a product image and return a card-ready URL.
 *
 * The stored URL bakes in the standard product-image transformation chain:
 *   e_sharpen:60        → crisp product edges
 *   f_auto,q_auto       → WebP/AVIF, alpha channel preserved
 *   w_600,h_720,c_pad   → pad to exact 5:6 card ratio (transparent fill)
 *
 * This means transparent-background PNGs float cleanly against the card's
 * glass surface in both light and dark mode, and any future product photos
 * are consistently sized and sharpened without extra client-side processing.
 *
 * Background removal: upload images with transparent backgrounds (PNG/WebP).
 * Cloudinary AI background removal is available via the `cloudinary_ai`
 * add-on — enable it on your Cloudinary dashboard and add
 * `background_removal: 'cloudinary_ai'` to the options below when ready.
 */
export async function uploadProductImage(
  buffer: Buffer,
  options?: { filename?: string },
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env['CLOUDINARY_CLOUD_NAME'] ?? 'dzhj5tgyv';

  // Upload raw — no preset dependency, direct options only.
  // Transformations are applied via URL so no upload preset is needed.
  const result = await uploadRaw(buffer, {
    folder: 'superstore/products',
    ...(options?.filename && {
      public_id: options.filename,
      use_filename: true,
    }),
    unique_filename: true,
    overwrite: false,
  });

  // Serve at low quality (q_auto:low) to keep image sizes small.
  // 600×720 pad preserves aspect ratio with transparent fill on the card glass.
  const cardUrl =
    `https://res.cloudinary.com/${cloudName}/image/upload` +
    `/e_sharpen:40,f_auto,q_auto:low,w_600,h_720,c_pad/${result.public_id}`;

  return { url: cardUrl, publicId: result.public_id };
}

export async function uploadCategoryImage(
  buffer: Buffer,
): Promise<CloudinaryUploadResult> {
  const result = await uploadRaw(buffer, {
    folder: 'superstore/categories',
    transformation: [
      { quality: 'auto', fetch_format: 'auto', width: 800, crop: 'limit' },
    ],
    unique_filename: true,
  });
  return { url: result.secure_url, publicId: result.public_id };
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
