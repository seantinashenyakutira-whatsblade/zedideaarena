import { z } from 'zod'

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').optional(),
  nationality: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  profession: z.string().min(2).max(100).optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  current_mode: z.enum(['contestant', 'voter']).optional(),
})

export const modeSwitchSchema = z.object({
  current_mode: z.enum(['contestant', 'voter'], {
    required_error: 'Mode must be contestant or voter',
  }),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ModeSwitchInput = z.infer<typeof modeSwitchSchema>
