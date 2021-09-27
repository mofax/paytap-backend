import { z } from "zod";

export function validateZOD<T extends z.ZodTypeAny>(
  schema: T,
  data: Object
): z.infer<T> {
  schema.parse(data);
  return data;
}

export const CreateAdmin = z.object({
  userName: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const CreateStudent = z.object({
  schoolID: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  admissionNumber: z.string().min(3).max(10),
});

export const CreateSchoolStaff = z.object({
  userName: z.string(),
  schoolID: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const CreateSchoolPOS = z.object({
  userName: z.string(),
  schoolID: z.string(),
  password: z.string(),
  description: z.string(),
});

export const CreateSchool = z.object({
  name: z.string(),
  code: z.string().min(3).max(6),
});
