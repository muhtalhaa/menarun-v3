import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function isPrismaClientReady(client: PrismaClient | undefined): client is PrismaClient {
  return Boolean(client?.activityReport?.findMany);
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  if (isPrismaClientReady(cached)) {
    return cached;
  }

  if (cached) {
    void (cached as PrismaClient).$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();

  if (!isPrismaClientReady(client)) {
    throw new Error(
      'Prisma client belum memuat model ActivityReport. Jalankan "npx prisma generate" lalu restart dev server.'
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
