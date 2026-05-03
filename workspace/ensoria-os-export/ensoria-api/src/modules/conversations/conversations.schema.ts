import { z } from 'zod/v4';

export const CreateConversationBody = z.object({
  channel: z.enum(['webchat', 'whatsapp', 'email', 'social', 'gmail', 'manual']).default('manual'),
  direction: z.enum(['inbound', 'outbound']).default('inbound'),
  subject: z.string().optional().nullable(),
  content: z.string().min(1),
  sentiment: z.number().min(-1).max(1).optional().nullable(),
});

export type CreateConversationBody = z.infer<typeof CreateConversationBody>;
