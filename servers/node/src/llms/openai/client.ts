import OpenAI from 'openai'


class OpenAIClient {
  private static instance: OpenAI

  private constructor() { }

  public static getInstance(): OpenAI {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
    return OpenAIClient.instance
  }
}

export const openai = OpenAIClient.getInstance()

export const MODELS = {
  'gpt_4o': 'gpt-4o-2024-08-06',
  'gpt_4o_mini': 'gpt-4o-mini',
} as const
