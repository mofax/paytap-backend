import { PrismaClient } from "@prisma/client";
import mKsuid from "mksuid";
const prisma = new PrismaClient();

async function main() {
  const schoolID = mKsuid();

  await prisma.schools.upsert({
    create: {
      id: schoolID,
      name: "Kanga High School",
      code: "KHS",
    },
    update: {
      name: "Kanga High School",
    },
    where: {
      id: schoolID,
    },
  });

  await prisma.students.create({
    data: {
      id: mKsuid(),
      firstName: "Job",
      lastName: "Omino",
      admissionNumber: "KHS8787",
      user: {
        create: {
          id: mKsuid(),
          username: "KHS8787",
          password: "olombe",
          accounts: {
            create: {
              id: mKsuid(),
              label: "main",
            },
          },
        },
      },
      school: {
        connect: {
          id: schoolID,
        },
      },
    },
  });

  await prisma.posUsers.create({
    data: {
      id: mKsuid(),
      description: "canteen 1",
      user: {
        create: {
          id: mKsuid(),
          username: "KHSposone",
          password: "olombepod",
          accounts: {
            create: {
              id: mKsuid(),
              label: "main",
            },
          },
        },
      },
      school: {
        connect: {
          id: schoolID,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
