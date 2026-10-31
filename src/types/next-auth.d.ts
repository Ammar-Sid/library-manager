import 'next-auth';
import type { RoleName } from '@/lib/roles';

declare module 'next-auth' {
  interface User {
    id: string;
    role: RoleName;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: RoleName;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: RoleName;
  }
}
