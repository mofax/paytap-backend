import { PrismaClient } from ".prisma/client";

const client = new PrismaClient();

const mainUserID = "bE3VogHhyio2Tv2VCwlvSgU3vj";
export const mainAccountID = "bE3VogHhw2WUQlQTpV6ztscCQN";

export async function createDefaultRecords() {
  const user = await client.users.findUnique({
    where: {
      id: mainUserID,
    },
  });

  if (user) {
    return;
  } else {
    await client.users.create({
      data: {
        id: mainUserID,
        username: "main",
        password: "cdcdcdcdijidje",
        accounts: {
          create: {
            id: mainAccountID,
          },
        },
      },
    });
  }
}
