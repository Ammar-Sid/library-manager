// Maximum upload size: 50MB
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

// Allowed MIME types for book uploads
export const ALLOWED_MIME_TYPES = ['application/pdf'] as const;

// PDF magic bytes (first 4 bytes: %PDF)
export const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x44, 0x46, 0x46]);

/**
 * Validates MIME type is application/pdf
 */
export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]);
}

/**
 * Validates file size does not exceed the maximum allowed bytes.
 */
export function isValidFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_BYTES;
}

/**
 * Validates file signature (magic bytes) to confirm it's a PDF.
 * PDF files begin with %PDF (%44 46 44 46 in hex).
 */
export function hasValidPdfSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46    // F
  );
}

/**
 * Sanitize a filename to be safe for storage.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
