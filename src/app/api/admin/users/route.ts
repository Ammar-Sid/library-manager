import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveUser, isSuperAdmin } from '@/lib/security';
import { isUserStatus, UserStatus } from '@/lib/roles';

// GET /api/admin/users - List all users (SUPER_ADMIN only)
export async function GET(req: NextRequest) {
  const user = await getActiveUser(req);
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { books: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

// PATCH /api/admin/users - Update user status (SUPER_ADMIN only)
export async function PATCH(req: NextRequest) {
  const user = await getActiveUser(req);
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { userId?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { userId, status } = body;

  if (typeof userId !== 'string' || typeof status !== 'string') {
    return NextResponse.json({ error: 'userId and status are required' }, { status: 400 });
  }

  if (!isUserStatus(status)) {
    const validStatuses = Object.values(UserStatus);
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, email: true, name: true, status: true },
  });

  return NextResponse.json({ user: updatedUser });
}
