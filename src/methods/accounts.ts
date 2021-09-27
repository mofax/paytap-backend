import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchAllJournalEntries() {
  return await prisma.journalEntries.findMany({});
}

export async function fetchAllAccounts() {
  return await prisma.accounts.findMany({
    include: {
      user: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}
