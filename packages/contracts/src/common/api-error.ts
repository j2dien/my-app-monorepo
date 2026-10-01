import { z } from "zod";

export const validationErrorDetailsSchema = z.object({
  formErrors: z.array(z.string()),
  fieldErrors: z.record(z.string(), z.array(z.string())),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    requestId: z.string().min(1),
    details: validationErrorDetailsSchema.optional(),
  }),
});

export type ValidationErrorDetails = z.infer<
  typeof validationErrorDetailsSchema
>;

export type ApiError = z.infer<typeof apiErrorSchema>;