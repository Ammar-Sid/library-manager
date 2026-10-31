/**
 * @jest-environment node
 */

/**
 * Phase 3 TDD - Book Upload API Endpoint tests
 * Tests: Test A - validation failure, Test B - successful upload mock
 */
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    book: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        role: 'USER',
        status: 'ACTIVE',
      }),
    },
  },
}));

// Mock next-auth JWT
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock blob storage
jest.mock('@/lib/blob-storage', () => ({
  uploadPdfToBlob: jest.fn(),
}));

import { POST } from '@/app/api/books/upload/route';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { uploadPdfToBlob } from '@/lib/blob-storage';

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockUploadPdf = uploadPdfToBlob as jest.MockedFunction<typeof uploadPdfToBlob>;
const mockBookCreate = prisma.book.create as jest.MockedFunction<typeof prisma.book.create>;

function createMultipartRequest(fields: Record<string, string | File | null>): NextRequest {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null) {
      formData.append(key, value);
    }
  }
  return new NextRequest('http://localhost:3000/api/books/upload', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/books/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test A - Validation Failures', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetToken.mockResolvedValueOnce(null);
      const req = createMultipartRequest({});
      const response = await POST(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toMatch(/unauthorized/i);
    });

    it('returns 400 when no file provided', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'user-1', role: 'USER' } as ReturnType<typeof getToken> extends Promise<infer T> ? T : never);
      const req = createMultipartRequest({ title: 'My Book' });
      const response = await POST(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toMatch(/no file/i);
    });

    it('returns 400 when title is missing', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'user-1', role: 'USER' } as ReturnType<typeof getToken> extends Promise<infer T> ? T : never);
      const pdfFile = new File([Buffer.from('%PDF-1.4')], 'test.pdf', {
        type: 'application/pdf',
      });
      const req = createMultipartRequest({ file: pdfFile });
      const response = await POST(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toMatch(/title/i);
    });

    it('returns 400 for non-PDF MIME type (image/jpeg)', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'user-1', role: 'USER' } as ReturnType<typeof getToken> extends Promise<infer T> ? T : never);
      const jpgFile = new File([Buffer.from('JFIF')], 'image.jpg', {
        type: 'image/jpeg',
      });
      const req = createMultipartRequest({ file: jpgFile, title: 'My Book' });
      const response = await POST(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toMatch(/invalid file type|pdf/i);
    });

    it('rejects a file with a PDF MIME type but invalid PDF signature', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'user-1', role: 'USER' } as ReturnType<typeof getToken> extends Promise<infer T> ? T : never);
      const invalidPdf = new File([Buffer.from('not a PDF')], 'fake.pdf', {
        type: 'application/pdf',
      });
      const req = createMultipartRequest({ file: invalidPdf, title: 'Fake PDF' });

      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(mockUploadPdf).not.toHaveBeenCalled();
      expect(mockBookCreate).not.toHaveBeenCalled();
    });
  });

  describe('Test B - Successful Upload', () => {
    it('returns 201 with book record on valid PDF upload', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'user-1', role: 'USER' } as ReturnType<typeof getToken> extends Promise<infer T> ? T : never);
      mockUploadPdf.mockResolvedValueOnce({
        url: 'https://blob.vercel-storage.com/books/user-1/123-test.pdf',
        pathname: 'books/user-1/123-test.pdf',
        size: 1024,
        contentType: 'application/pdf',
      });
      mockBookCreate.mockResolvedValueOnce({
        id: 'book-1',
        title: 'Clean Architecture',
        description: 'A software design book',
        pdfUrl: 'https://blob.vercel-storage.com/books/user-1/123-test.pdf',
        coverUrl: null,
        uploadedBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      const pdfContent = Buffer.from('%PDF-1.4 test content');
      const pdfFile = new File([pdfContent], 'clean-architecture.pdf', {
        type: 'application/pdf',
      });
      const req = createMultipartRequest({
        file: pdfFile,
        title: 'Clean Architecture',
        description: 'A software design book',
      });

      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.message).toMatch(/uploaded successfully/i);
      expect(json.book.id).toBe('book-1');
      expect(json.book.title).toBe('Clean Architecture');
      expect(json.book.pdfUrl).toContain('blob.vercel-storage.com');
    });
  });
});
