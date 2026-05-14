import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeRichText } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('strips <script> tags', () => {
    const dirty = 'Hello<script>alert(1)</script> world';
    expect(sanitizeText(dirty)).toBe('Hello world');
  });

  it('strips all HTML tags but keeps text', () => {
    expect(sanitizeText('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic');
  });

  it('removes javascript: URLs in attributes by stripping tags entirely', () => {
    const dirty = '<a href="javascript:alert(1)">click me</a>';
    expect(sanitizeText(dirty)).toBe('click me');
  });

  it('removes onerror handlers', () => {
    const dirty = '<img src="x" onerror="alert(1)" /> tag';
    expect(sanitizeText(dirty)).toBe(' tag');
  });

  it('handles null / undefined / empty', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText('')).toBe('');
  });

  it('passes plain text through unchanged', () => {
    expect(sanitizeText('Just a normal review of this rice.')).toBe(
      'Just a normal review of this rice.',
    );
  });
});

describe('sanitizeRichText', () => {
  it('keeps allowed markup (b, i, em, strong, br, p)', () => {
    const dirty = '<p>Great <strong>quality</strong> rice!</p>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toContain('<p>');
    expect(clean).toContain('<strong>');
    expect(clean).toContain('Great');
    expect(clean).toContain('rice');
  });

  it('strips disallowed tags like <script> and <iframe>', () => {
    const dirty = '<p>Hello</p><script>alert(1)</script><iframe src="evil"></iframe>';
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('<iframe');
    expect(clean).toContain('<p>Hello</p>');
  });

  it('strips event handler attributes from allowed tags', () => {
    const dirty = '<p onclick="alert(1)" style="color:red">Hello</p>';
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('alert');
  });
});
