import { z } from 'zod'

export const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  category: z.string().min(2, 'Category is required'),
  competition_id: z.string().uuid('Invalid competition'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description too long'),
  problem_statement: z.string().max(2000).optional(),
  video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  deck_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type IdeaInput = z.infer<typeof ideaSchema>
