import { PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { signJWTToken, verifyExistingPassword } from "../util/crypto";
import { handleErrorFastify } from "../util/errors";

const prisma = new PrismaClient();

const LoginBodySchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function LogIn(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = LoginBodySchema.parse(req.body);
    const user = await prisma.users.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      return reply
        .status(401)
        .send({ message: "invalid username or password" });
    }

    if (user.type === "NONE") {
      return reply
        .status(401)
        .send({ message: "invalid username or password" });
    }

    const verify = await verifyExistingPassword(body.password, user.password);

    if (!verify) {
      return reply
        .status(401)
        .send({ message: "invalid username or password" });
    }

    const jwt = await signJWTToken({
      username: user.username,
      type: user.type,
    });

    return reply.status(200).send({ token: jwt });
  } catch (error) {
    return handleErrorFastify(error, reply);
  }
}
