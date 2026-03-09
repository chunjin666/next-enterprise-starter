import 'server-only'
import OpenAI from 'openai'
import { unstable_cache } from 'next/cache'
import type { EmbeddingService, EmbeddingInput } from '@/shared/domain/ai/embedding.model'
import { logger } from '@/infra/observability/logger'
import { ok, err, type Result } from '@/shared/kernel/result'
import { classifyError } from '@/infra/errors/classifier'
import type { AppError } from '@/shared/kernel/errors'

// SiliconFlow Configuration
const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY
// Default to BAAI/bge-m3 (1024 dimensions)
const DEFAULT_MODEL = 'BAAI/bge-m3'

// Standalone function for caching
// We create a fresh client here because unstable_cache needs a serializable context
// and runs somewhat independently of the class instance.
const fetchEmbeddingFromAPI = async (text: string, model: string): Promise<number[]> => {
  if (!SILICONFLOW_API_KEY) {
    logger.warn('SILICONFLOW_API_KEY is not set. Returning mock vector.')
    return new Array(1024).fill(0)
  }

  const client = new OpenAI({
    apiKey: SILICONFLOW_API_KEY,
    baseURL: SILICONFLOW_BASE_URL,
  })

  try {
    const start = Date.now()
    const response = await client.embeddings.create({
      model: model,
      input: text,
      encoding_format: 'float',
    })
    const duration = Date.now() - start

    const embedding = response.data[0].embedding

    // Validation: Check dimension
    if (embedding.length !== 1024) {
      logger.warn(`Embedding dimension mismatch. Expected 1024, got ${embedding.length}. Model: ${model}`)
    }

    logger.info({ 
      model, 
      dimension: embedding.length,
      duration_ms: duration,
      text_prefix: text.slice(0, 20) 
    }, 'Embedding API Call (Cache Miss)')

    return embedding
  } catch (error) {
    logger.error({ error, model }, 'Failed to generate embedding via SiliconFlow')
    throw error
  }
}

// Cache wrapper
// NOTE: Next.js unstable_cache uses the Data Cache (filesystem by default).
// It does NOT have built-in LRU or max-size eviction for the default handler.
// To prevent infinite disk growth from random search queries, we MUST set a revalidate time (TTL).
// For production with high throughput, configure a custom Cache Handler (e.g., Redis) in next.config.js.
const getCachedEmbedding = unstable_cache(
  fetchEmbeddingFromAPI,
  ['embedding-generation'], // Cache key parts
  { 
    revalidate: 60 * 60 * 24, // Cache for 24 hours (Safety net for disk usage)
    tags: ['embedding'] 
  }
)

export class SiliconFlowEmbeddingService implements EmbeddingService {
  // Note: The class no longer holds stateful client for the actual generation
  // to support Next.js caching mechanism which prefers pure functions.

  async generateEmbedding(input: EmbeddingInput): Promise<Result<number[], AppError>> {
    const model = input.model || DEFAULT_MODEL
    
    try {
      // Use the cached version
      // The cache key is automatically derived from the arguments (text, model)
      const embedding = await getCachedEmbedding(input.text, model)
      return ok(embedding)
    } catch (error) {
      return err(classifyError(error))
    }
  }
}

// Singleton instance
export const embeddingService = new SiliconFlowEmbeddingService()
