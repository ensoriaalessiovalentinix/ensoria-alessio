import { z } from 'zod/v4';

export const CreateRequirementBody = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(['need', 'goal', 'requirement']).default('requirement'),
  status: z.enum(['open', 'in-progress', 'met', 'cancelled']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export const UpdateRequirementBody = CreateRequirementBody.partial();

export type CreateRequirementBody = z.infer<typeof CreateRequirementBody>;
export type UpdateRequirementBody = z.infer<typeof UpdateRequirementBody>;
