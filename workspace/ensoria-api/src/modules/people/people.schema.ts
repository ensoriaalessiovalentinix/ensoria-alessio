import { z } from 'zod/v4';

export const CreatePeopleBody = z.object({
  type: z.enum(['client', 'staff', 'partner', 'freelancer', 'company', 'investor']).default('client'),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  stage: z.string().default('Contact'),
  notes: z.string().optional().nullable(),
  tags: z.string().default(''),
});

export const UpdatePeopleBody = CreatePeopleBody.partial();

export const StageChangeBody = z.object({
  stage: z.enum(['Contact', 'Opportunity', 'Client', 'Recurring Client']),
});

export const PeopleQuery = z.object({
  type: z.string().optional(),
  stage: z.string().optional(),
  search: z.string().optional(),
});

export const PEOPLE_STAGES = ['Contact', 'Opportunity', 'Client', 'Recurring Client'] as const;

export type CreatePeopleBody = z.infer<typeof CreatePeopleBody>;
export type UpdatePeopleBody = z.infer<typeof UpdatePeopleBody>;
