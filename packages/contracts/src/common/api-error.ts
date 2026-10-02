import { z } from "zod";

export const apiErrorDetailsSchema  = z.object({
  fields: z.record(z.string(), z.array(z.string())).optional(),
  formErrors: z.array(z.string()).optional(),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    requestId: z.string().min(1),
    details: apiErrorDetailsSchema.optional(),
  }),
});


export type ApiErrorDetails = z.infer<typeof apiErrorDetailsSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;