import { z } from 'zod'

export const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  competition_id: z.string().uuid('Invalid competition'),
  problem: z.string().min(20, 'Problem description must be at least 20 characters').max(5000, 'Problem too long'),
  solution: z.string().min(20, 'Solution description must be at least 20 characters').max(5000, 'Solution too long'),
  industry: z.string().min(2, 'Industry is required'),
  business_model: z.string().max(2000).optional(),
  pitch_video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type IdeaInput = z.infer<typeof ideaSchema>
