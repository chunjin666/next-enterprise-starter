import { z } from 'zod';

export const uuidSchema = z.uuid('Invalid UUID format')
export const urlSchema = z.url('Invalid URL format').max(2000, 'URL too long')
export const textSchema = z.string().trim()
export const nonEmptyTextSchema = textSchema.min(1, 'Cannot be empty')
