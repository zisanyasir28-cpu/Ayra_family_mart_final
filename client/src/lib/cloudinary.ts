// ─── Cloudinary URL Optimizer ─────────────────────────────────────────────────
//
// Builds (or rewrites) a Cloudinary image URL with width/quality/format
// transforms. Works with both:
//   • a raw publicId         → `posts/burger-king`
//   • a full Cloudinary URL  → `https://res.cloudinary.com/<cloud>/image/upload/v123/...`
//
// Non-Cloudinary URLs are returned unchanged (graceful for demo mode where
// images may be served from `/demo/...` or external CDNs).

const CLOUD_NAME = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'] ?? '';

interface OptimizeOpts {
  width?:   number;
  quality?: 'auto' | number;
  format?:  'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  opts: OptimizeOpts = {},
): string {
  if (!publicIdOrUrl) return publicIdOrUrl;

  const { width = 600, quality = 'auto', format = 'auto' } = opts;
  const transforms = `w_${width},q_${quality},f_${format},c_limit`;

  // Full Cloudinary URL → splice transforms after `/upload/`
  if (publicIdOrUrl.includes('res.cloudinary.com') && publicIdOrUrl.includes('/upload/')) {
    return publicIdOrUrl.replace('/upload/', `/upload/${transforms}/`);
  }

  // Anything else with a protocol → return as-is (external CDN, demo data, etc.)
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  // Build URL from publicId
  if (!CLOUD_NAME) return publicIdOrUrl;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
}

// ─── Size presets ─────────────────────────────────────────────────────────────

export const thumb  = (id: string): string => getOptimizedImageUrl(id, { width: 200 });
export const card   = (id: string): string => getOptimizedImageUrl(id, { width: 400 });
export const detail = (id: string): string => getOptimizedImageUrl(id, { width: 900 });
export const hero   = (id: string): string => getOptimizedImageUrl(id, { width: 1600 });
