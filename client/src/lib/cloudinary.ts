// ─── Cloudinary URL Optimizer ─────────────────────────────────────────────────
//
// Builds (or rewrites) a Cloudinary image URL with width/quality/format
// transforms. Works with:
//   • a raw publicId         → `products/burger-king`
//   • a plain Cloudinary URL → `https://res.cloudinary.com/<cloud>/image/upload/v123/...`
//
// Pre-transformed URLs (those with baked-in transform params directly after
// /upload/, e.g. our demo CDN URLs) are returned as-is to avoid conflicting
// double-transform chains.
//
// Non-Cloudinary URLs are returned unchanged (graceful for Unsplash, etc.).

const CLOUD_NAME = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'] ?? '';

interface OptimizeOpts {
  width?:   number;
  quality?: 'auto' | number;
  format?:  'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

/**
 * Returns true when the string directly after /upload/ is a Cloudinary
 * transformation segment (contains _ : or ,) rather than a version string
 * (v\d+) or a plain public_id. We skip double-processing these URLs because
 * their full transform chain is already baked in.
 */
function isPreTransformed(url: string): boolean {
  const uploadIdx = url.indexOf('/upload/');
  if (uploadIdx === -1) return false;
  const afterUpload  = url.slice(uploadIdx + 8); // skip '/upload/'
  const firstSegment = afterUpload.split('/')[0] ?? '';
  // Transform params always contain _ or : or ,; version strings are v\d+
  return /[_:,]/.test(firstSegment) && !/^v\d+/.test(firstSegment);
}

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  opts: OptimizeOpts = {},
): string {
  if (!publicIdOrUrl) return publicIdOrUrl;

  const { width = 600, quality = 'auto', format = 'auto' } = opts;
  const transforms = `w_${width},q_${quality},f_${format},c_limit`;

  // Full Cloudinary URL ──────────────────────────────────────────────────────
  if (publicIdOrUrl.includes('res.cloudinary.com') && publicIdOrUrl.includes('/upload/')) {
    // Already has its own transform chain → return unchanged to avoid conflict
    if (isPreTransformed(publicIdOrUrl)) return publicIdOrUrl;
    // Plain URL (e.g. /upload/v123/path) → splice transforms
    return publicIdOrUrl.replace('/upload/', `/upload/${transforms}/`);
  }

  // External CDN (Unsplash, etc.) → return as-is ────────────────────────────
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  // Raw publicId → build full URL ───────────────────────────────────────────
  if (!CLOUD_NAME) return publicIdOrUrl;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
}

// ─── Size presets ─────────────────────────────────────────────────────────────

export const thumb  = (id: string): string => getOptimizedImageUrl(id, { width: 200 });
export const card   = (id: string): string => getOptimizedImageUrl(id, { width: 400 });
export const detail = (id: string): string => getOptimizedImageUrl(id, { width: 900 });
export const hero   = (id: string): string => getOptimizedImageUrl(id, { width: 1600 });
