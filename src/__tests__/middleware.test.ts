/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

import { proxy } from '@/proxy';

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

function createMockRequest(pathname: string): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

describe('Proxy authentication and authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unauthenticated requests from admin routes to sign-in', async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const response = await proxy(createMockRequest('/admin/dashboard'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/signin');
  });

  it('returns 403 when a standard user requests an admin route', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'user-1',
      role: 'USER',
    } as Awaited<ReturnType<typeof getToken>>);

    const response = await proxy(createMockRequest('/admin/dashboard'));

    expect(response.status).toBe(403);
  });

  it('allows super admins to access admin routes', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'admin-1',
      role: 'SUPER_ADMIN',
    } as Awaited<ReturnType<typeof getToken>>);

    const response = await proxy(createMockRequest('/admin/dashboard'));

    expect(response.status).toBe(200);
  });

  it('redirects unauthenticated requests from dashboard routes', async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const response = await proxy(createMockRequest('/dashboard'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/signin');
  });

  it('allows authenticated standard users to access dashboard routes', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'user-1',
      role: 'USER',
    } as Awaited<ReturnType<typeof getToken>>);

    const response = await proxy(createMockRequest('/dashboard'));

    expect(response.status).toBe(200);
  });
});
