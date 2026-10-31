/**
 * Phase 3 TDD - File validation helper tests
 */
import {
  isValidMimeType,
  isValidFileSize,
  hasValidPdfSignature,
  sanitizeFilename,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/file-validation';

describe('File Validation Utils', () => {
  describe('isValidMimeType', () => {
    it('accepts application/pdf', () => {
      expect(isValidMimeType('application/pdf')).toBe(true);
    });

    it('rejects image/png', () => {
      expect(isValidMimeType('image/png')).toBe(false);
    });

    it('rejects application/msword', () => {
      expect(isValidMimeType('application/msword')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidMimeType('')).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('accepts a file within limit', () => {
      expect(isValidFileSize(1024)).toBe(true);
    });

    it('rejects a file at the limit boundary', () => {
      expect(isValidFileSize(MAX_FILE_SIZE_BYTES)).toBe(true);
    });

    it('rejects a file exceeding the limit', () => {
      expect(isValidFileSize(MAX_FILE_SIZE_BYTES + 1)).toBe(false);
    });

    it('rejects a zero-byte file', () => {
      expect(isValidFileSize(0)).toBe(false);
    });

    it('rejects a negative size', () => {
      expect(isValidFileSize(-1)).toBe(false);
    });
  });

  describe('hasValidPdfSignature', () => {
    it('returns true for valid PDF magic bytes %PDF', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
      expect(hasValidPdfSignature(pdfBuffer)).toBe(true);
    });

    it('returns false for non-PDF buffer', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG magic
      expect(hasValidPdfSignature(pngBuffer)).toBe(false);
    });

    it('returns false for empty buffer', () => {
      expect(hasValidPdfSignature(Buffer.from([]))).toBe(false);
    });

    it('returns false for buffer shorter than 4 bytes', () => {
      expect(hasValidPdfSignature(Buffer.from([0x25, 0x50]))).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('converts spaces to underscores', () => {
      expect(sanitizeFilename('my book.pdf')).toBe('my_book.pdf');
    });

    it('removes special characters', () => {
      expect(sanitizeFilename('book (2023)!.pdf')).toBe('book_2023_.pdf');
    });

    it('collapses multiple underscores', () => {
      expect(sanitizeFilename('hello   world.pdf')).toBe('hello_world.pdf');
    });

    it('lowercases the filename', () => {
      expect(sanitizeFilename('MyBook.PDF')).toBe('mybook.pdf');
    });
  });
});
