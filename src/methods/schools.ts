import {POJO} from "../db/types";
import {CreateSchool, validateZOD} from "../db/zod";
import {assignId} from "./common";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export async function createSchool(data: POJO) {
    const school = validateZOD(CreateSchool, data);
    return await prisma.schools.create({
        data: assignId({
            name: school.name,
            code: school.code
        })
    })
}

export async function fetchAllSchools() {
    return await prisma.schools.findMany()
}

export async function fetchSchoolById(fetch: { id: string }) {
    return await prisma.schools.findUnique({
        where: {
            id: fetch.id
        }
    })
}

export async function fetchAllSchoolStudents(fetch: { schoolID: string }) {
    return await prisma.students.findMany({
        where: {
            schoolID: fetch.schoolID
        }
    })
}

export async function fetchAllSchoolStaffBySchool(fetch: { schoolID: string }) {
    return await prisma.schoolStaff.findMany({
        where: {
            schoolID: fetch.schoolID
        }
    })
}