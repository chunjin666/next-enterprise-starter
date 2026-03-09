import { z } from 'zod'
import type { Result } from '@/shared/kernel/result'
import type { AppError } from '@/shared/kernel/errors'

// Define input schema for embedding generation
export const EmbeddingInputSchema = z.object({
  text: z.string().min(1),
  model: z.string().optional(),
})

export type EmbeddingInput = z.infer<typeof EmbeddingInputSchema>

export interface EmbeddingService {
  /**
   * Generate embeddings for the given text.
   * Returns a vector of numbers.
   * The dimension depends on the underlying model (e.g., 1024 for BGE-M3).
   */
  generateEmbedding(input: EmbeddingInput): Promise<Result<number[], AppError>>
}
