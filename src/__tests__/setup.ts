import { afterAll } from '@jest/globals';
import prisma from '../lib/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});