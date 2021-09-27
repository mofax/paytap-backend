import { FastifyReply } from "fastify";
import { JsonWebTokenError } from "jsonwebtoken";
import { ZodError } from "zod";
import { POJO } from "../db/types";
import { logger } from "../logger";

export function handleErrorFastify(err: Error, reply: FastifyReply) {
  if (err instanceof ZodError) {
    const res: POJO = {};
    for (let issue of err.issues) {
      if (issue.path[0]) {
        res[issue.path[0]] = issue.message;
      }
    }

    return reply
      .status(400)
      .send({ error: { instance: "ValidationError", issues: res } });
  } else if (err instanceof JsonWebTokenError) {
    return reply.status(401).send({
      error: {
        instance: "AuthenticationError",
        message: "Authentication Required",
      },
    });
  } else {
    logger.error(err);
    return reply
      .status(500)
      .send({ error: { message: "internal server error" } });
  }
}
