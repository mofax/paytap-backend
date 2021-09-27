import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { aggregateAccountBalancesMany } from "../db/accountRecords";
import { mainAccountID } from "../db/defaultRecords";
import { POJO } from "../db/types";
import { assignId } from "../methods/common";

const prisma = new PrismaClient();

export async function IncomingMpesaDeposit(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const body = req.body as POJO;
  const reference: string = body["reference"] as string;
  const amount = parseFloat(body["amount"] as string);

  if (!reference) {
    return reply.status(500).send({ error: "error" });
  }

  if (Number.isNaN(amount)) {
    return reply.status(500).send({ error: "amount is NaN" });
  }

  const user = await prisma.users.findUnique({
    where: {
      username: reference,
    },
  });

  if (!user) {
    return reply.status(400).send({ error: "user not found" });
  }

  const mainAccount = await prisma.accounts.findUnique({
    where: {
      id: mainAccountID,
    },
  });

  const targetAccount = await prisma.accounts.findUnique({
    where: {
      accounts_userID_label_key: {
        userID: user.id,
        label: "main",
      },
    },
  });

  if (!mainAccount || !targetAccount) {
    return reply.status(400).send({ error: "error user not found" });
  }

  const transactionAmount = Math.ceil(amount * 100);

  const journalTx = prisma.journalEntries.create({
    data: assignId({
      description: "INBOUND MPESA",
      amount: transactionAmount,
      credits: {
        create: assignId({
          accountID: mainAccountID,
          amount: transactionAmount,
        }),
      },
      debits: {
        create: assignId({
          accountID: targetAccount.id,
          amount: transactionAmount,
        }),
      },
    }),
  });

  await prisma.$transaction([journalTx]);
  aggregateAccountBalancesMany(targetAccount, mainAccount);
  return reply.status(200).send({ data: "success" });
}
