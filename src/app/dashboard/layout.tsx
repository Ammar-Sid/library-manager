import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { BookOpen, Upload, Users, LogOut } from 'lucide-react';
import { Role, UserStatus } from '@/lib/roles';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });
  if (!user || user.status !== UserStatus.ACTIVE) redirect('/auth/signin');

  const isAdmin = user.role === Role.SUPER_ADMIN;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900/80 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">LibraryOS</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            id="nav-browse"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 text-sm font-medium"
          >
            <BookOpen className="h-4 w-4" />
            Browse Books
          </Link>
          <Link
            href="/dashboard/upload"
            id="nav-upload"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 text-sm font-medium"
          >
            <Upload className="h-4 w-4" />
            Upload Book
          </Link>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              id="nav-admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {session.user.name ?? 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            id="nav-signout"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
