import { PrismaClient, accounts } from "@prisma/client";
const prisma = new PrismaClient();

async function aggregateAccountEntries(accountID: string) {
  const debitTX = prisma.debits.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      accountID: accountID,
    },
  });

  const creditTX = prisma.credits.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      accountID: accountID,
    },
  });

  const [debits, credits] = await Promise.all([debitTX, creditTX]);

  return {
    debitsTotal: debits._sum.amount || 0,
    creditsTotal: credits._sum.amount || 0,
  };
}

async function aggregateAccountBalanceOne(accountID: string) {
  const { debitsTotal, creditsTotal } = await aggregateAccountEntries(
    accountID
  );

  return prisma.accounts.update({
    data: {
      balance: debitsTotal - creditsTotal,
    },
    where: {
      id: accountID,
    },
  });
}

export async function aggregateAccountBalancesMany(...accounts: accounts[]) {
  const promises = accounts.map((acc) => aggregateAccountBalanceOne(acc.id));
  try {
    await Promise.all(promises);
    return true;
  } catch {
    return false;
  }
}
