import { z } from 'zod/v4';

export const CreateCollaboratorBody = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateCollaboratorBody = z.infer<typeof CreateCollaboratorBody>;
