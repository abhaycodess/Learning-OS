/**
 * AI Client Service
 *
 * Abstracts AI provider calls (OpenAI, Google Gemini, Hugging Face, etc.)
 * Provides a single interface for calling AI models
 *
 * Requires environment variables:
 * - OPENAI_API_KEY (for OpenAI)
 * - GOOGLE_AI_API_KEY (for Google Gemini)
 * - HUGGINGFACE_API_KEY (for Hugging Face)
 *
 * Optional environment variables:
 * - AI_PROVIDER=openai|google|huggingface (forces provider choice)
 * - OPENAI_MODEL, GOOGLE_MODEL, HUGGINGFACE_MODEL (override defaults)
 */

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo'
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-2.0-flash'
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'HuggingFaceH4/zephyr-7b-beta'
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions'
const SYSTEM_PROMPT =
  'You are Nexis, a helpful AI study coach for a learning platform. Introduce yourself as Nexis when relevant and provide clear, concise, and structured responses.'
const HF_DEFAULT_FALLBACK_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'meta-llama/Llama-3.1-8B-Instruct',
]

class AIClient {
  constructor() {
    this.preferredProvider = (process.env.AI_PROVIDER || '').trim().toLowerCase()
    this.openaiKey = process.env.OPENAI_API_KEY
    this.googleKey = process.env.GOOGLE_AI_API_KEY
    this.huggingFaceKey = process.env.HUGGINGFACE_API_KEY
    this.hfModels = this.buildHuggingFaceModelList()
    this.provider = this.detectProvider()
  }

  buildHuggingFaceModelList() {
    const extra = (process.env.HUGGINGFACE_FALLBACK_MODELS || '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)

    return [...new Set([HUGGINGFACE_MODEL, ...extra, ...HF_DEFAULT_FALLBACK_MODELS])]
  }

  /**
   * Detect which AI provider is configured
   */
  detectProvider() {
    if (this.preferredProvider) {
      if (!['openai', 'google', 'huggingface'].includes(this.preferredProvider)) {
        throw new Error(`Invalid AI_PROVIDER: ${this.preferredProvider}. Use openai, google, or huggingface`)
      }

      if (this.preferredProvider === 'openai' && !this.openaiKey) {
        throw new Error('AI_PROVIDER is openai but OPENAI_API_KEY is missing')
      }

      if (this.preferredProvider === 'google' && !this.googleKey) {
        throw new Error('AI_PROVIDER is google but GOOGLE_AI_API_KEY is missing')
      }

      if (this.preferredProvider === 'huggingface' && !this.huggingFaceKey) {
        throw new Error('AI_PROVIDER is huggingface but HUGGINGFACE_API_KEY is missing')
      }

      return this.preferredProvider
    }

    if (this.huggingFaceKey) return 'huggingface'
    if (this.openaiKey) return 'openai'
    if (this.googleKey) return 'google'
    throw new Error('No AI provider configured. Set HUGGINGFACE_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY in environment')
  }

  /**
   * Main entry point for AI calls
   */
  async call({ prompt, temperature = 0.7, maxTokens = 2000, timeoutMs = 20000 }) {
    if (!prompt) throw new Error('Prompt is required')

    if (this.provider === 'huggingface') {
      return this.callHuggingFace(prompt, temperature, maxTokens, timeoutMs)
    }

    if (this.provider === 'openai') {
      return this.callOpenAI(prompt, temperature, maxTokens, timeoutMs)
    } else if (this.provider === 'google') {
      return this.callGoogle(prompt, temperature, maxTokens, timeoutMs)
    }

    throw new Error(`Unknown AI provider: ${this.provider}`)
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt, temperature, maxTokens, timeoutMs) {
    try {
      const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      }, timeoutMs)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) throw new Error('No content in OpenAI response')

      return {
        provider: 'openai',
        content,
        model: OPENAI_MODEL,
      }
    } catch (error) {
      throw new Error(`OpenAI call failed: ${error.message}`)
    }
  }

  /**
   * Call Google Gemini API
   */
  async callGoogle(prompt, temperature, maxTokens, timeoutMs) {
    try {
      const response = await this.fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent?key=${this.googleKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
            systemInstruction: {
              parts: [
                {
                  text: SYSTEM_PROMPT,
                },
              ],
            },
          }),
        },
        timeoutMs,
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Google API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!content) throw new Error('No content in Google response')

      return {
        provider: 'google',
        content,
        model: GOOGLE_MODEL,
      }
    } catch (error) {
      throw new Error(`Google call failed: ${error.message}`)
    }
  }

  /**
   * Call Hugging Face (router first, then inference endpoint fallback)
   */
  async callHuggingFace(prompt, temperature, maxTokens, timeoutMs) {
    const errors = []

    for (const model of this.hfModels) {
      try {
        return await this.callHuggingFaceRouter(model, prompt, temperature, maxTokens, timeoutMs)
      } catch (error) {
        errors.push(`${model}: ${error.message}`)
      }
    }

    throw new Error(
      `Hugging Face routing failed for all models. ${errors.join(' | ')}. ` +
        'Ensure your Hugging Face token has "Make calls to Inference Providers" enabled.',
    )
  }

  async callHuggingFaceRouter(model, prompt, temperature, maxTokens, timeoutMs) {
    const response = await this.fetchWithTimeout(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.huggingFaceKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    }, timeoutMs)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || error.message || response.statusText)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) throw new Error('No content in Hugging Face router response')

    return {
      provider: 'huggingface',
      content,
      model,
    }
  }

  async fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController()
    const timeoutRef = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      })
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeoutMs}ms`)
      }

      throw error
    } finally {
      clearTimeout(timeoutRef)
    }
  }

  /**
   * Get current provider info (useful for debugging)
   */
  getInfo() {
    return {
      provider: this.provider,
      model:
        this.provider === 'openai'
          ? OPENAI_MODEL
          : this.provider === 'google'
            ? GOOGLE_MODEL
            : HUGGINGFACE_MODEL,
    }
  }
}

// Singleton instance
let instance = null

function getAIClient() {
  if (!instance) {
    instance = new AIClient()
  }
  return instance
}

module.exports = { getAIClient, AIClient }
