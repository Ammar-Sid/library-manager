import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@/lib/roles';

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookRecord {
  id: string;
  title: string;
  description: string | null;
  pdfUrl: string;
  coverUrl: string | null;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id?: string;
    name: string | null;
    email: string;
  };
}

interface StoreData {
  users: UserRecord[];
  books: BookRecord[];
  files: Map<string, { buffer: Buffer; contentType: string; name: string }>;
}

const globalForStore = globalThis as unknown as {
  __library_store?: StoreData;
};

function initializeStore(): StoreData {
  if (globalForStore.__library_store) {
    return globalForStore.__library_store;
  }

  const adminPasswordHash = bcrypt.hashSync('Admin1234!', 10);
  const userPasswordHash = bcrypt.hashSync('User1234!', 10);

  const initialUsers: UserRecord[] = [
    {
      id: 'e2e-admin',
      email: 'admin@example.com',
      name: 'E2E Admin',
      password: bcrypt.hashSync('adminpassword123', 10),
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'e2e-test-user',
      email: 'testuser@example.com',
      name: 'E2E Test User',
      password: bcrypt.hashSync('password123', 10),
      role: Role.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'usr_admin_001',
      email: 'admin@library.com',
      name: 'System Admin',
      password: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'usr_demo_002',
      email: 'ammaar.siddiqui2@gmail.com',
      name: 'Ammaar Siddiqui',
      password: userPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'usr_demo_003',
      email: 'user@library.com',
      name: 'Jane Reader',
      password: userPasswordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  const initialBooks: BookRecord[] = [
    {
      id: 'book_001',
      title: 'Design Patterns & Clean Architecture',
      description: 'Comprehensive guide to modern software engineering patterns, modular systems, and clean decoupled design.',
      pdfUrl: '/api/books/files/sample-clean-code',
      coverUrl: null,
      uploadedBy: 'usr_admin_001',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      user: {
        id: 'usr_admin_001',
        name: 'System Admin',
        email: 'admin@library.com',
      },
    },
    {
      id: 'book_002',
      title: 'Mastering TypeScript & Full-Stack Web',
      description: 'Essential practices for production TypeScript, Next.js server actions, and type-safe APIs.',
      pdfUrl: '/api/books/files/sample-ts',
      coverUrl: null,
      uploadedBy: 'usr_demo_002',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      user: {
        id: 'usr_demo_002',
        name: 'Ammaar Siddiqui',
        email: 'ammaar.siddiqui2@gmail.com',
      },
    },
    {
      id: 'book_003',
      title: 'Cloud Infrastructure & High Availability',
      description: 'Zero-downtime deployments, distributed caches, edge computing, and serverless best practices.',
      pdfUrl: '/api/books/files/sample-cloud',
      coverUrl: null,
      uploadedBy: 'usr_admin_001',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
      user: {
        id: 'usr_admin_001',
        name: 'System Admin',
        email: 'admin@library.com',
      },
    },
  ];

  const store: StoreData = {
    users: initialUsers,
    books: initialBooks,
    files: new Map(),
  };

  globalForStore.__library_store = store;
  return store;
}

const store = initializeStore();

export const fileStore = {
  save(id: string, buffer: Buffer, contentType: string, name: string) {
    store.files.set(id, { buffer, contentType, name });
  },
  get(id: string) {
    return store.files.get(id);
  },
};

export const prisma = {
  user: {
    async findUnique({
      where,
      select,
    }: {
      where: { email?: string; id?: string };
      select?: any;
    }): Promise<any> {
      let found: UserRecord | undefined;
      if (where.email) {
        found = store.users.find(
          (u) => u.email.toLowerCase() === where.email?.toLowerCase()
        );
      } else if (where.id) {
        found = store.users.find((u) => u.id === where.id);
      }
      return found ? { ...found } : null;
    },

    async findMany(args?: any) {
      let list = [...store.users];
      if (args?.orderBy?.createdAt === 'desc') {
        list.reverse();
      }

      return list.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        _count: {
          books: store.books.filter((b) => b.uploadedBy === user.id).length,
        },
      }));
    },

    async create({ data, select }: { data: any; select?: any }) {
      const newUser: UserRecord = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        email: data.email.toLowerCase(),
        name: data.name ?? null,
        password: data.password,
        role: data.role ?? Role.USER,
        status: data.status ?? UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.users.push(newUser);
      return { ...newUser };
    },

    async update({ where, data, select }: { where: { id: string }; data: any; select?: any }) {
      const index = store.users.findIndex((u) => u.id === where.id);
      if (index === -1) throw new Error('User not found');
      store.users[index] = {
        ...store.users[index],
        ...data,
        updatedAt: new Date(),
      };
      return { ...store.users[index] };
    },
  },

  book: {
    async findUnique({ where, include }: { where: { id: string }; include?: any }): Promise<BookRecord | null> {
      const book = store.books.find((b) => b.id === where.id);
      if (!book) return null;

      const user = store.users.find((u) => u.id === book.uploadedBy);
      return {
        ...book,
        user: {
          id: user?.id,
          name: user?.name ?? 'Community Member',
          email: user?.email ?? 'member@library.com',
        },
      };
    },

    async findFirst({ where }: { where: any }): Promise<BookRecord | null> {
      const found = store.books.find((b) => {
        if (where.pdfUrl) {
          if (typeof where.pdfUrl === 'string') return b.pdfUrl === where.pdfUrl;
          return b.pdfUrl.includes(where.pdfUrl.contains);
        }
        if (where.OR) {
          return where.OR.some((clause: any) => {
            if (typeof clause.pdfUrl === 'string') return b.pdfUrl === clause.pdfUrl;
            if (clause.pdfUrl && typeof clause.pdfUrl === 'object') {
              return b.pdfUrl.includes(clause.pdfUrl.contains);
            }
            return false;
          });
        }
        return false;
      });
      return found ? { ...found } : null;
    },

    async findMany(args?: any) {
      let filtered = [...store.books];

      if (args?.where?.title?.contains) {
        const query = args.where.title.contains.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            (b.description && b.description.toLowerCase().includes(query))
        );
      }

      if (args?.orderBy?.createdAt === 'desc') {
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else {
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      const skip = args?.skip ?? 0;
      const take = args?.take ?? filtered.length;
      const paged = filtered.slice(skip, skip + take);

      return paged.map((book) => {
        const user = store.users.find((u) => u.id === book.uploadedBy);
        return {
          ...book,
          user: {
            id: user?.id,
            name: user?.name ?? 'Community Member',
            email: user?.email ?? '',
          },
        };
      });
    },

    async count(args?: any): Promise<number> {
      if (!args?.where?.title?.contains) return store.books.length;
      const query = args.where.title.contains.toLowerCase();
      return store.books.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query))
      ).length;
    },

    async create({ data }: { data: any }): Promise<BookRecord> {
      const user = store.users.find((u) => u.id === data.uploadedBy);
      const newBook: BookRecord = {
        id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: data.title,
        description: data.description ?? null,
        pdfUrl: data.pdfUrl,
        coverUrl: null,
        uploadedBy: data.uploadedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: user?.id,
          name: user?.name ?? 'Community Member',
          email: user?.email ?? '',
        },
      };

      store.books.unshift(newBook);
      return { ...newBook };
    },
  },
};
