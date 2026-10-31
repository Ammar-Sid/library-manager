'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, User, ExternalLink, Eye } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  description?: string | null;
  pdfUrl: string;
  coverUrl?: string | null;
  createdAt: string | Date;
  user?: {
    name?: string | null;
    email: string;
  };
}

interface BookGridProps {
  books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="h-16 w-16 text-indigo-400 mb-4 opacity-60" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No books yet</h3>
        <p className="text-slate-500">Be the first to upload a book to the library.</p>
      </div>
    );
  }

  return (
    <div
      data-testid="book-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {books.map((book) => (
        <article
          key={book.id}
          data-testid={`book-card-${book.id}`}
          className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
          onMouseEnter={() => setHoveredId(book.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Book Cover / Placeholder */}
          <div className="relative h-52 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 flex items-center justify-center overflow-hidden">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-60">
                <BookOpen className="h-14 w-14 text-indigo-400" />
                <span className="text-xs text-indigo-300 font-medium uppercase tracking-wider">
                  PDF
                </span>
              </div>
            )}

            {/* View overlay on hover */}
            <div
              className={`absolute inset-0 bg-indigo-900/80 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                hoveredId === book.id ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Link
                href={`/dashboard/books/${book.id}`}
                aria-label={`View ${book.title}`}
                data-testid={`view-book-${book.id}`}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${book.title} in new tab`}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Book Info */}
          <div className="p-4">
            <h3
              data-testid={`book-title-${book.id}`}
              className="font-semibold text-slate-100 text-base leading-snug mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors"
            >
              {book.title}
            </h3>

            {book.description && (
              <p className="text-slate-400 text-sm line-clamp-2 mb-3">{book.description}</p>
            )}

            <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-slate-700/50">
              {book.user && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  <span data-testid={`book-uploader-${book.id}`} className="truncate">
                    {book.user.name ?? book.user.email}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                <time dateTime={new Date(book.createdAt).toISOString()}>
                  {new Date(book.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
