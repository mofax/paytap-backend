import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod";
import { aggregateAccountBalancesMany } from "../db/accountRecords";
import { POJO } from "../db/types";
import { logger } from "../logger";
import { assignId } from "../methods/common";

const prisma = new PrismaClient();

const posTransactionBody = z.object({
  amount: z.number(),
  receipt: z.object({}).passthrough(),
  buyerID: z.string(),
  posID: z.string(),
});

export async function IncomingPosTransaction(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = posTransactionBody.parse(req.body);
    const transactionAmount = body.amount * 100;

    const [buyer, pos] = await prisma.$transaction([
      prisma.users.findUnique({
        where: {
          id: body.buyerID,
        },
        include: {
          accounts: {
            where: {
              label: "main",
            },
          },
        },
      }),

      prisma.users.findUnique({
        where: {
          id: body.posID,
        },
        include: {
          accounts: {
            where: {
              label: "main",
            },
          },
          posUser: true,
        },
      }),
    ]);

    if (!pos || !pos.accounts || !pos.accounts[0] || !pos.posUser) {
      throw new Error("pos not found");
    }

    if (!buyer || !buyer.accounts || !buyer.accounts[0]) {
      throw new Error("buyer not found");
    }

    if (buyer.accounts[0]?.balance < transactionAmount) {
      throw new Error("not enough balance");
    }

    await prisma.posTransactions.create({
      data: assignId({
        receipt: body.receipt,
        description: "INCOMING POS PAYMENT",
        amount: transactionAmount,
        pos: {
          connect: {
            id: pos.posUser.id,
          },
        },
        buyer: {
          connect: {
            id: buyer.id,
          },
        },
        journalEntry: {
          create: assignId({
            description: "POS TRANSACTION",
            amount: transactionAmount,
            credits: {
              create: assignId({
                accountID: buyer.accounts[0].id,
                amount: transactionAmount,
              }),
            },
            debits: {
              create: assignId({
                accountID: pos.accounts[0].id,
                amount: transactionAmount,
              }),
            },
          }),
        },
      }),
    });

    reply.status(200).send({ data: "success" });
    aggregateAccountBalancesMany(pos.accounts[0], buyer.accounts[0]);
  } catch (err) {
    if (err instanceof ZodError) {
      const res: POJO = {};
      for (let issue of err.issues) {
        if (issue.path[0]) {
          res[issue.path[0]] = issue.message;
        }
      }

      reply
        .status(400)
        .send({ error: { instance: "ValidationError", issues: res } });
    } else {
      reply.status(500).send({ error: { message: "internal server error" } });
      logger.error(err);
    }
  }
}
