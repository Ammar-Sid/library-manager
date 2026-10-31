import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveUser } from '@/lib/security';

interface FileRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: FileRouteProps) {
  const user = await getActiveUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{10,}$/i.test(id)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Ensure this file belongs to a registered book
  const book = await prisma.book.findFirst({
    where: {
      OR: [
        { pdfUrl: `/api/books/files/${id}` },
        { pdfUrl: { contains: id } },
      ],
    },
    select: { id: true, title: true },
  });

  if (!book) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  let contents: Buffer;
  try {
    contents = await readFile(path.join(process.cwd(), '.library-files', `${id}.pdf`));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }
    throw error;
  }

  return new Response(new Uint8Array(contents), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
