'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Loader2, AlertCircle, CheckCircle, Ban, UserX } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  _count: { books: number };
}

const statusColors = {
  ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  SUSPENDED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  BANNED: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/users')
      .then(async (res) => ({ res, data: await res.json() }))
      .then(({ res, data }) => {
        if (!active) return;
        if (!res.ok) {
          setError(data.error || 'Failed to load users');
          return;
        }
        setUsers(data.users);
        setError('');
      })
      .catch(() => {
        if (active) setError('Failed to load users. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateUserStatus(userId: string, status: string) {
    setUpdating(userId);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status }),
    });

    const data = await res.json();
    setUpdating(null);

    if (!res.ok) {
      setError(data.error || 'Update failed');
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: data.user.status } : u))
      );
      setNotification(`User ${data.user.email} status updated to ${data.user.status}`);
      setTimeout(() => setNotification(''), 3000);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Shield className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-0.5">Manage platform users and content</p>
        </div>
      </div>

      {notification && (
        <div
          role="status"
          className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6"
        >
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-sm">{notification}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
        >
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Users table */}
      <div className="card border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-white">Platform Users</h2>
          </div>
          <span className="text-slate-500 text-sm">{users.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['User', 'Role', 'Status', 'Books', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    data-testid={`user-row-${user.id}`}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                          {(user.name ?? user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.name ?? 'Unnamed'}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          user.role === 'SUPER_ADMIN'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-slate-400 bg-slate-700/30 border-slate-600/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        data-testid={`user-status-${user.id}`}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[user.status]}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{user._count.books}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {user.role !== 'SUPER_ADMIN' && (
                        <div className="flex items-center gap-2">
                          {user.status !== 'SUSPENDED' && (
                            <button
                              data-testid={`suspend-user-${user.id}`}
                              disabled={updating === user.id}
                              onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                              className="btn-danger text-xs"
                            >
                              {updating === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <UserX className="h-3 w-3" />
                              )}
                              Suspend
                            </button>
                          )}
                          {user.status !== 'BANNED' && (
                            <button
                              data-testid={`ban-user-${user.id}`}
                              disabled={updating === user.id}
                              onClick={() => updateUserStatus(user.id, 'BANNED')}
                              className="btn-danger text-xs"
                            >
                              {updating === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Ban className="h-3 w-3" />
                              )}
                              Ban
                            </button>
                          )}
                          {user.status !== 'ACTIVE' && (
                            <button
                              data-testid={`activate-user-${user.id}`}
                              disabled={updating === user.id}
                              onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium text-xs rounded-lg transition-all duration-200"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Activate
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
