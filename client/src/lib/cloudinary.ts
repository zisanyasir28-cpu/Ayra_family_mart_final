// ─── Cloudinary URL Builder — @cloudinary/url-gen SDK ─────────────────────────
//
// All URLs are constructed via the official Cloudinary URL-gen SDK:
//   https://cloudinary.com/documentation/javascript_integration
//
// No manual string construction — every transform is typed and composable.
//
// Three URL categories handled:
//   1. Pre-transformed Cloudinary URLs (demo CDN — transforms already baked in)
//      → returned as-is; re-processing would double-stack transforms.
//   2. Plain Cloudinary URLs (e.g. /upload/v123/publicId stored in DB)
//      → publicId extracted, URL rebuilt via SDK.
//   3. External URLs (Unsplash, S3, etc.)
//      → returned unchanged.
//   4. Raw publicIds (no protocol)
//      → URL built via SDK directly.

import { Cloudinary }          from '@cloudinary/url-gen';
import { quality, format }     from '@cloudinary/url-gen/actions/delivery';
import { limitFit, pad }       from '@cloudinary/url-gen/actions/resize';
import { sharpen }             from '@cloudinary/url-gen/actions/adjust';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat }  from '@cloudinary/url-gen/qualifiers/format';
import { color }               from '@cloudinary/url-gen/qualifiers/background';

const CLOUD_NAME = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'] ?? '';

// Disable Cloudinary's SDK analytics tracking param (?_a=...)
const cld = new Cloudinary({
  cloud: { cloudName: CLOUD_NAME },
  url:   { analytics: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * True when the string directly after /upload/ is a Cloudinary transform
 * segment (contains _ : or ,) rather than a version string (v\d+) or plain id.
 * These URLs already have their full transform chain baked in and must NOT
 * be re-processed.
 */
function isPreTransformed(url: string): boolean {
  const idx   = url.indexOf('/upload/');
  if (idx === -1) return false;
  const first = url.slice(idx + 8).split('/')[0] ?? '';
  return /[_:,]/.test(first) && !/^v\d+/.test(first);
}

/** Extracts publicId from a plain Cloudinary URL (with optional version). */
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\?.*)?$/);
  return match?.[1] ?? null;
}

// ─── Internal builder ─────────────────────────────────────────────────────────

interface OptimizeOpts {
  width?:   number;
  height?:  number;
  /** 'limit' (default) = c_limit  |  'pad' = c_pad */
  crop?:    'limit' | 'pad';
  bgColor?: string;  // only used when crop = 'pad'
}

function buildSdkUrl(publicId: string, opts: OptimizeOpts = {}): string {
  if (!CLOUD_NAME) return publicId;
  const { width = 600, height, crop = 'limit', bgColor = 'white' } = opts;

  let img = cld.image(publicId)
    .delivery(quality(autoQuality()))
    .delivery(format(autoFormat()));

  if (crop === 'pad') {
    const r = pad().width(width).background(color(bgColor));
    img = img.resize(height ? r.height(height) : r);
  } else {
    const r = limitFit().width(width);
    img = img.resize(height ? r.height(height) : r);
  }

  return img.toURL();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  opts: OptimizeOpts = {},
): string {
  if (!publicIdOrUrl) return publicIdOrUrl;

  // Full Cloudinary URL ──────────────────────────────────────────────────────
  if (publicIdOrUrl.includes('res.cloudinary.com') && publicIdOrUrl.includes('/upload/')) {
    if (isPreTransformed(publicIdOrUrl)) return publicIdOrUrl; // baked transforms → untouched
    const pid = extractPublicId(publicIdOrUrl);
    return pid ? buildSdkUrl(pid, opts) : publicIdOrUrl;
  }

  // External URL (Unsplash, etc.) ───────────────────────────────────────────
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  // Raw publicId ────────────────────────────────────────────────────────────
  return buildSdkUrl(publicIdOrUrl, opts);
}

// ─── Size presets (used by ProductCard, ProductDetailPage, etc.) ──────────────

/** 200 px c_limit — order line thumbnails, wishlist chips */
export const thumb = (id: string): string =>
  getOptimizedImageUrl(id, { width: 200 });

/** 400 px c_limit — product grid cards */
export const card = (id: string): string =>
  getOptimizedImageUrl(id, { width: 400 });

/** 900 px c_limit — product detail page */
export const detail = (id: string): string =>
  getOptimizedImageUrl(id, { width: 900 });

/** 1 600 px c_limit — hero banners */
export const hero = (id: string): string =>
  getOptimizedImageUrl(id, { width: 1600 });

// ─── Demo product URL builder (used by demoProducts.ts) ───────────────────────
//
// Source images already have transparent backgrounds (pre-processed in Cloudinary UI).
// Transform chain:
//   e_sharpen:80   → crisp product edges
//   c_pad,600×720  → pad to exact 5:6 card ratio, no cropping (transparent fill)
//   q_40/f_auto    → WebP/AVIF at quality 40, alpha preserved
//
// NOTE: e_improve was removed — it's AI-based and adds 1–5 s first-request latency.
// Images are already well-processed from Cloudinary UI; sharpen alone is sufficient.
//
export function buildDemoProductUrl(publicId: string): string {
  if (!CLOUD_NAME) {
    // No env var (GitHub Pages / CI) — fall back to the hardcoded cloud name
    return `https://res.cloudinary.com/dzhj5tgyv/image/upload/e_sharpen:80/c_pad,w_600,h_720/q_40/f_auto/${publicId}`;
  }
  return cld
    .image(publicId)
    .adjust(sharpen(80))                   // e_sharpen:80 — edge crispness
    .resize(
      pad()
        .width(600)
        .height(720),                      // c_pad,w_600,h_720 — transparent padding
    )
    .delivery(quality(40))                 // q_40
    .delivery(format(autoFormat()))        // f_auto (WebP/AVIF, alpha preserved)
    .toURL();
}
