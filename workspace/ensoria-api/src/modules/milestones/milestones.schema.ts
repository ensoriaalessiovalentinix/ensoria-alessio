import { z } from 'zod/v4';

export const CreateMilestoneBody = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).default('pending'),
});

export const UpdateMilestoneBody = CreateMilestoneBody.partial();

export type CreateMilestoneBody = z.infer<typeof CreateMilestoneBody>;
export type UpdateMilestoneBody = z.infer<typeof UpdateMilestoneBody>;
