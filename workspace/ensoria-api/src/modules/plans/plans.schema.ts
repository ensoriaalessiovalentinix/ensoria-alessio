import { z } from 'zod/v4';

export const CreatePlanBody = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export const UpdatePlanBody = CreatePlanBody.partial();

export type CreatePlanBody = z.infer<typeof CreatePlanBody>;
export type UpdatePlanBody = z.infer<typeof UpdatePlanBody>;
