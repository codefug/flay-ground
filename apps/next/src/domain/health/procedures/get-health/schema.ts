import { z } from "zod";

export const getHealthResponseSchema = z.object({
  bff: z.literal("ok"),
  domain: z.string(),
  checkedAt: z.string(),
});

export type GetHealthResponse = z.infer<typeof getHealthResponseSchema>;
