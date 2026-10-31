import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveUser } from '@/lib/security';
import { uploadPdfToBlob } from '@/lib/blob-storage';
import { hasValidPdfSignature, isValidMimeType, isValidFileSize } from '@/lib/file-validation';

export async function POST(req: NextRequest) {
  // 1. Auth check
  const user = await getActiveUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;
  const description = formData.get('description') as string | null;

  // 3. Validate required fields
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: 'Book title is required' }, { status: 400 });
  }

  // 4. Validate MIME type
  if (!isValidMimeType(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type: ${file.type}. Only PDF files are allowed.` },
      { status: 400 }
    );
  }

  // 5. Validate file size
  if (!isValidFileSize(file.size)) {
    return NextResponse.json(
      { error: 'File size exceeds the 50MB limit or is empty.' },
      { status: 400 }
    );
  }

  const fileContents = Buffer.from(await file.arrayBuffer());
  if (!hasValidPdfSignature(fileContents)) {
    return NextResponse.json(
      { error: 'Invalid PDF file signature.' },
      { status: 400 }
    );
  }

  // 6. Upload PDF
  let blobResult;
  try {
    blobResult = await uploadPdfToBlob(file, user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 7. Create DB record
  const book = await prisma.book.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? null,
      pdfUrl: blobResult.url,
      uploadedBy: user.id,
    },
  });

  // Revalidate library paths so the new book appears immediately
  try {
    revalidatePath('/dashboard');
    revalidatePath('/api/books');
  } catch {
    // In edge runtime or test environments
  }

  return NextResponse.json(
    {
      message: 'Book uploaded successfully',
      book: {
        id: book.id,
        title: book.title,
        description: book.description,
        pdfUrl: book.pdfUrl,
        createdAt: book.createdAt,
      },
    },
    { status: 201 }
  );
}
