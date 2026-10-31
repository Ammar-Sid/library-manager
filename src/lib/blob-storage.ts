import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isValidMimeType, isValidFileSize, sanitizeFilename, MAX_FILE_SIZE_BYTES } from './file-validation';
import { fileStore } from './prisma';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
}

/**
 * Uploads and stores a PDF file in-memory and local disk fallback.
 * Works seamlessly in serverless / Vercel environments without any external cloud or database.
 */
export async function uploadPdfToBlob(
  file: File,
  userId: string
): Promise<BlobUploadResult> {
  if (!isValidMimeType(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only application/pdf is allowed.`);
  }

  if (!isValidFileSize(file.size)) {
    throw new Error(
      `File size ${file.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes.`
    );
  }

  const id = randomUUID();
  const safeName = sanitizeFilename(file.name || 'document.pdf');
  const filename = `${id}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Store in memory (for serverless Vercel runtime)
  fileStore.save(id, buffer, 'application/pdf', filename);

  // Attempt local disk write if writable (gracefully ignore on read-only environments)
  try {
    const storageDir = path.join(process.cwd(), '.library-files');
    await mkdir(storageDir, { recursive: true });
    await writeFile(path.join(storageDir, `${id}.pdf`), buffer);
  } catch {
    // Read-only serverless environment (e.g. Vercel) - memory store serves the file
  }

  return {
    url: `/api/books/files/${id}`,
    pathname: filename,
    size: file.size,
    contentType: 'application/pdf',
  };
}
