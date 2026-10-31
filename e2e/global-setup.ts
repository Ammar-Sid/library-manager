import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function globalSetup() {
  try {
    const password = await bcrypt.hash('password123', 4);
    const adminPassword = await bcrypt.hash('adminpassword123', 4);

    await prisma.user.upsert({
      where: { email: 'testuser@example.com' },
      update: { id: 'e2e-test-user', role: 'USER', status: 'ACTIVE', password },
      create: {
        id: 'e2e-test-user',
        email: 'testuser@example.com',
        name: 'E2E Test User',
        password,
      },
    });
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { id: 'e2e-admin', role: 'SUPER_ADMIN', status: 'ACTIVE', password: adminPassword },
      create: {
        id: 'e2e-admin',
        email: 'admin@example.com',
        name: 'E2E Admin',
        password: adminPassword,
        role: 'SUPER_ADMIN',
      },
    });
    await prisma.book.deleteMany({ where: { uploadedBy: 'e2e-test-user' } });
  } finally {
    await prisma.$disconnect();
  }
}
