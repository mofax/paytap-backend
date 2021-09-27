import {
  CreateAdmin,
  CreateSchoolPOS,
  CreateSchoolStaff,
  CreateStudent,
  validateZOD,
} from "../db/zod";
import type { POJO } from "../db/types";
import { PrismaClient } from "@prisma/client";
import { assignId } from "./common";
import { hashNewPassword } from "../util/crypto";

const prisma = new PrismaClient();

export async function createAdmin(data: POJO) {
  const admin = validateZOD(CreateAdmin, data);
  return await prisma.users.create({
    select: { id: true, username: true },
    data: assignId({
      username: admin.userName,
      password: await hashNewPassword(admin.password),
      email: admin.email,
      type: "ADMIN",
      admin: {
        create: assignId({
          firstName: admin.firstName,
          lastName: admin.lastName,
        }),
      },
    }),
  });
}

export async function createStudent(data: POJO) {
  const student = validateZOD(CreateStudent, data);
  const school = await prisma.schools.findUnique({
    where: {
      id: student.schoolID,
    },
  });

  if (!school) {
    throw new Error(`school not found`);
  }

  return await prisma.users.create({
    select: { id: true, username: true },
    data: assignId({
      username: `${school.code}${student.admissionNumber}`,
      password: student.password,
      type: "STUDENT",
      accounts: {
        create: assignId({
          balance: 0,
        }),
      },
      student: {
        create: assignId({
          schoolID: student.schoolID,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
        }),
      },
    }),
  });
}

export async function createSchoolStaff(data: POJO) {
  const staff = validateZOD(CreateSchoolStaff, data);
  return await prisma.users.create({
    select: { id: true, username: true },
    data: assignId({
      username: staff.userName,
      password: await hashNewPassword(staff.password),
      type: "SCHOOL_STAFF",
      schoolStaff: {
        create: assignId({
          school: {
            connect: {
              id: staff.schoolID,
            },
          },
          firstName: staff.firstName,
          lastName: staff.lastName,
        }),
      },
    }),
  });
}

export async function createSchoolPOS(data: POJO) {
  const pos = validateZOD(CreateSchoolPOS, data);
  return await prisma.users.create({
    select: { id: true, username: true },
    data: assignId({
      username: pos.userName,
      password: await hashNewPassword(pos.password),
      type: "POS",
      accounts: {
        create: assignId({
          balance: 0,
        }),
      },
      posUser: {
        create: assignId({
          description: pos.description,
          school: {
            connect: {
              id: pos.schoolID,
            },
          },
        }),
      },
    }),
  });
}

export async function fetchAllUsers() {
  return await prisma.users.findMany({
    select: {
      id: true,
      username: true,
      admin: true,
      schoolStaff: true,
      student: true,
      accounts: true,
    },
  });
}

export async function fetchAllAdminUsers() {
  return await prisma.admins.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
}

export async function fetchAllStudents() {
  return await prisma.students.findMany({
    include: {
      user: {
        select: {
          id: true,
          accounts: true,
        },
      },
      school: true,
    },
  });
}

export async function fetchAllSchoolStaff() {
  return await prisma.schoolStaff.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
}

export async function fetchAllSchoolPOS() {
  return await prisma.posUsers.findMany({
    include: {
      user: {
        select: {
          username: true,
          accounts: {
            select: {
              balance: true,
            },
          },
        },
      },
      school: true,
    },
  });
}
