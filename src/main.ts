import Fastify from "fastify";
import * as methods from "./methods/methods";
import { POJOExtended } from "./db/types";
import { env } from "./config";
import { createDefaultRecords } from "./db/defaultRecords";
import { IncomingMpesaDeposit } from "./rest/incoming-deposits";
import { IncomingPosTransaction } from "./rest/pos-transaction";
import { LogIn } from "./rest/auth";
import { verifyJWTToken } from "./util/crypto";
import { handleErrorFastify } from "./util/errors";

function getParams(value: unknown): POJOExtended {
  if (typeof value === "object") {
    return Object.assign({}, value);
  }
  return Object.create(null);
}

function getMethod(name: keyof typeof methods) {
  const method = methods[name];
  if (typeof method === "function") {
    return method;
  }
  throw Error(`invalid method name ${name}`);
}

const fastify = Fastify({
  logger: {
    prettyPrint: env === "development",
  },
});

fastify.register(require("fastify-cors"), {
  origin: ["http://localhost:3001"],
});

fastify.get("/", function (_, reply) {
  reply.send({ hello: "world" });
});

fastify.post("/methods/:methodName", async function (request, reply) {
  try {
    const token = request.headers["x-token"] as string;
    const result = await verifyJWTToken(token);
    console.log(result);
    const { methodName } = getParams(request.params);
    const body = request.body;
    // @ts-ignore
    const method = getMethod(methodName);

    // @ts-ignore
    const res = await method(body);
    reply.status(200).send({ data: res });
  } catch (err) {
    handleErrorFastify(err, reply);
  }
});

fastify.get("/methods/list", function (_, reply) {
  const keys = Object.keys(methods);
  reply.send({ methods: keys });
});

fastify.post("/login", LogIn);
fastify.post("/mpesa/webhook", IncomingMpesaDeposit);
fastify.post("/pos/webhook", IncomingPosTransaction);

// Run the server!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});

// run create default records
createDefaultRecords();
