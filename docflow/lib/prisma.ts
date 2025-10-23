import { PrismaClient } from '../app/generated/prisma'

declare global {
  // évite plusieurs instances en dev (HMR)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const prisma = global.__prisma ?? new PrismaClient()
if (process.env.NODE_ENV === 'development') global.__prisma = prisma

export default prisma
