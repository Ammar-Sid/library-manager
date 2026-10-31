import { prisma } from '@/lib/prisma';
import BookGrid from '@/components/BookGrid';
import { Search } from 'lucide-react';

interface DashboardPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const PAGE_SIZE = 12;

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const search = params.search ?? '';

  const where = search
    ? { title: { contains: search } }
    : {};

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.book.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Library</h1>
          <p className="text-slate-400 mt-1">
            {total} book{total !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search */}
        <form method="GET" className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            name="search"
            type="search"
            defaultValue={search}
            className="input pl-10 pr-4"
            placeholder="Search books…"
            aria-label="Search books"
          />
        </form>
      </div>

      <BookGrid books={books.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <a
              href={`/dashboard?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="btn-secondary px-4 py-2"
            >
              ← Previous
            </a>
          )}
          <span className="text-slate-400 text-sm px-4">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/dashboard?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="btn-secondary px-4 py-2"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
