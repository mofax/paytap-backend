import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export async function fetchStudentById(fetch: {id: string}) {
    return await prisma.students.findUnique({
        where: {
            id: fetch.id
        },
        include: {
            user: {
                include: {
                    accounts: true
                }
            }
        }
    })
}