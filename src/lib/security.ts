import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, UserStatus } from '@/lib/roles';

/**
 * Extract and verify the JWT token from an incoming request.
 */
export async function getAuthToken(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'default-jwt-secret-for-library-os-2026',
  });
}

export async function getActiveUser(req: NextRequest) {
  const token = await getAuthToken(req);
  if (!token?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: token.id },
  });

  if (user) {
    if (user.status !== UserStatus.ACTIVE) return null;
    return { id: user.id, role: user.role };
  }

  // Fallback to signed JWT token claims (stateless serverless resilience)
  return {
    id: token.id as string,
    role: (token.role as string) ?? Role.USER,
  };
}

/**
 * Returns true if the token represents a SUPER_ADMIN user.
 */
export function isSuperAdmin(token: { role?: string } | null): boolean {
  return token?.role === Role.SUPER_ADMIN;
}

/**
 * Returns true if the token is valid (user is authenticated).
 */
export function isAuthenticated(token: unknown): boolean {
  return !!token;
}
