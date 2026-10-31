/**
 * @jest-environment node
 */

/**
 * Phase 2 TDD - Security utility function tests
 */
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { getActiveUser, isSuperAdmin, isAuthenticated } from '@/lib/security';

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockFindUser = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;

describe('Security Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveUser', () => {
    const request = new NextRequest('http://localhost:3000/api/books');

    it('returns null when no authenticated token is present', async () => {
      mockGetToken.mockResolvedValueOnce(null);

      await expect(getActiveUser(request)).resolves.toBeNull();
      expect(mockFindUser).not.toHaveBeenCalled();
    });

    it('returns null when the account is suspended', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'user-1' } as Awaited<ReturnType<typeof getToken>>);
      mockFindUser.mockResolvedValueOnce({ id: 'user-1', role: 'USER', status: 'SUSPENDED' } as never);

      await expect(getActiveUser(request)).resolves.toBeNull();
    });

    it('returns the current database role for an active account', async () => {
      mockGetToken.mockResolvedValueOnce({ id: 'admin-1' } as Awaited<ReturnType<typeof getToken>>);
      mockFindUser.mockResolvedValueOnce({
        id: 'admin-1',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      } as never);

      await expect(getActiveUser(request)).resolves.toEqual({
        id: 'admin-1',
        role: 'SUPER_ADMIN',
      });
    });
  });

  describe('isSuperAdmin', () => {
    it('returns true for SUPER_ADMIN role', () => {
      expect(isSuperAdmin({ role: 'SUPER_ADMIN' })).toBe(true);
    });

    it('returns false for USER role', () => {
      expect(isSuperAdmin({ role: 'USER' })).toBe(false);
    });

    it('returns false for null token', () => {
      expect(isSuperAdmin(null)).toBe(false);
    });

    it('returns false for empty role', () => {
      expect(isSuperAdmin({ role: '' })).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true for a valid token', () => {
      expect(isAuthenticated({ id: 'user-1', role: 'USER' })).toBe(true);
    });

    it('returns false for null', () => {
      expect(isAuthenticated(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isAuthenticated(undefined)).toBe(false);
    });
  });
});
