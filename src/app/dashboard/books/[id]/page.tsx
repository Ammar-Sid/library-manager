import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BookOpen, User, Calendar, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  let book = await prisma.book.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  // If not found by primary id, also search by pdfUrl containing id
  if (!book) {
    book = await prisma.book.findFirst({
      where: {
        OR: [{ pdfUrl: `/api/books/files/${id}` }, { pdfUrl: { contains: id } }],
      },
    });
  }

  if (!book) notFound();

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Book header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <BookOpen className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{book.title}</h1>
              {book.description && (
                <p className="text-slate-400 mt-2 max-w-xl">{book.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {book.user?.name ?? book.user?.email ?? 'Community Member'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {book.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <a
            href={book.pdfUrl}
            download
            className="btn-secondary shrink-0"
            aria-label={`Download ${book.title}`}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </div>

        {/* PDF Viewer */}
        <div
          data-testid="pdf-viewer"
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden"
          style={{ height: '80vh' }}
        >
          <iframe
            src={`${book.pdfUrl}#view=FitH`}
            title={`PDF viewer for ${book.title}`}
            className="w-full h-full"
            style={{ border: 'none' }}
            aria-label={`Embedded PDF: ${book.title}`}
          />
        </div>
      </div>
    </div>
  );
}
