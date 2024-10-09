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
  'o1': 'o1-preview-2024-09-12',
  'o1_mini': 'o1-mini-2024-09-12',
  'gpt_4o': 'gpt-4o-2024-08-06',
  'gpt_4o_mini': 'gpt-4o-mini',
} as const
