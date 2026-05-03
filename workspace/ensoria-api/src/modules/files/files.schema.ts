import { z } from 'zod/v4';

export const CreateFileBody = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(['file', 'link']).default('file'),
  mimeType: z.string().optional().nullable(),
  size: z.number().int().positive().optional().nullable(),
});

export type CreateFileBody = z.infer<typeof CreateFileBody>;
