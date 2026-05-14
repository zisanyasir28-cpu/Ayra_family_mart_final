import DOMPurify from 'dompurify';

// ─── DOMPurify Sanitization Helpers ───────────────────────────────────────────
//
// Use these wherever you render user-generated content (review text,
// product Q&A, notification messages from admins, etc.).
//
// Defaults are intentionally strict:
//   • sanitizeText:    strips ALL tags and attributes — safe for {value}
//                      JSX rendering (which already auto-escapes, but this
//                      adds belt-and-suspenders for cases where the data
//                      flows into dangerouslySetInnerHTML or third-party libs).
//   • sanitizeRichText: allows minimal markup for review formatting.

export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(String(input), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(String(input), {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}
