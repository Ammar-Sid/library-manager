import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma, fileStore } from '@/lib/prisma';
import { getActiveUser } from '@/lib/security';

interface FileRouteProps {
  params: Promise<{ id: string }>;
}

function createSamplePdf(title: string): Buffer {
  // Minimal valid PDF string
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 100 >>
stream
BT
/F1 24 Tf
100 700 Td
(${title}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000228 00000 n 
0000000378 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
456
%%EOF`;
  return Buffer.from(pdfString);
}

export async function GET(req: NextRequest, { params }: FileRouteProps) {
  const user = await getActiveUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // 1. Check in-memory file store (zero-db serverless store)
  const memoryFile = fileStore.get(id);
  if (memoryFile) {
    return new Response(new Uint8Array(memoryFile.buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // 2. Sample preloaded book handler
  if (id.startsWith('sample-')) {
    const sampleBuffer = createSamplePdf(
      id === 'sample-clean-code'
        ? 'Design Patterns and Clean Architecture'
        : id === 'sample-ts'
        ? 'Mastering TypeScript & Full-Stack Web'
        : 'Cloud Infrastructure and High Availability'
    );

    return new Response(new Uint8Array(sampleBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // 3. Fallback to local filesystem if available
  try {
    const contents = await readFile(path.join(process.cwd(), '.library-files', `${id}.pdf`));
    return new Response(new Uint8Array(contents), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
