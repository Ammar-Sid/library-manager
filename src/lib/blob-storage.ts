import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isValidMimeType, isValidFileSize, sanitizeFilename, MAX_FILE_SIZE_BYTES } from './file-validation';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
}

/**
 * Local storage driver: stores uploaded PDFs on the local filesystem.
 * No external Vercel Blob cloud dependency.
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

  // Store in .library-files directory locally
  const storageDir = path.join(process.cwd(), '.library-files');
  await mkdir(storageDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(storageDir, `${id}.pdf`);

  await writeFile(filePath, buffer);

  return {
    url: `/api/books/files/${id}`,
    pathname: filename,
    size: file.size,
    contentType: 'application/pdf',
  };
}
