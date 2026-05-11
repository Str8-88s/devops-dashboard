import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const isTest = process.env.NODE_ENV === 'test'
const connectionString = isTest
  ? process.env.TEST_DATABASE_URL!
  : process.env.DATABASE_URL!

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export default prisma