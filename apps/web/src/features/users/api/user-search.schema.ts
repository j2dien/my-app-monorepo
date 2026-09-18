import { z } from "zod";

export const userSearchSchema = z.object({
    page: z
        .number()
        .int()
        .positive()
        .default(1)
        .catch(1),

    pageSize: z
        .union([
            z.literal(10),
            z.literal(20),
            z.literal(50),
            z.literal(100),
        ])
        .default(20)
        .catch(20),

    search: z
        .string()
        .trim()
        .max(100)
        .optional(),

    sortBy: z
        .enum([
            "name",
            "email",
            "createdAt",
        ])
        .default("createdAt")
        .catch("createdAt"),

    sortOrder: z
        .enum([
            "asc",
            "desc",
        ])
        .default("desc")
        .catch("desc"),
});

export type UserSearch =
    z.infer<typeof userSearchSchema>;