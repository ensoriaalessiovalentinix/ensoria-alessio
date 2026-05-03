import { z } from 'zod/v4';

export const PROJECT_STAGES = [
  'Contact', 'Opportunity', 'Proposal', 'Implementation',
  'Onboarding', 'Live', 'Validated',
] as const;

/** Sub-statuses per stage: which sub-status values are valid for each stage */
export const PROJECT_SUB_STATUSES: Record<string, readonly string[]> = {
  Proposal: [
    'Proposal Preparation',
    'Proposal Accepted',
    'Waiting for Contract & Payment',
  ] as const,
};

export const CreateProjectBody = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  stage: z.string().default('Contact'),
  subStatus: z.string().optional().nullable(),
  value: z.number().positive().optional().nullable(),
  peopleId: z.string(),
});

export const UpdateProjectBody = CreateProjectBody.partial();

export const StageChangeBody = z.object({
  stage: z.enum(PROJECT_STAGES),
});

export const SubStatusChangeBody = z.object({
  subStatus: z.string(),
});

export const ProjectQuery = z.object({
  stage: z.string().optional(),
  peopleId: z.string().optional(),
  search: z.string().optional(),
});

export type CreateProjectBody = z.infer<typeof CreateProjectBody>;
export type UpdateProjectBody = z.infer<typeof UpdateProjectBody>;
