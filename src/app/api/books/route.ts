import { NextRequest, NextResponse } from 'next/server';
import { getActiveUser } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const user = await getActiveUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const search = searchParams.get('search') ?? '';

  const where = search
    ? {
        title: {
          contains: search,
        },
      }
    : {};

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.book.count({ where }),
  ]);

  return NextResponse.json({
    books,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}
