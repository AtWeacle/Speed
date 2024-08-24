import Anthropic from '@anthropic-ai/sdk'


class AnthropicClient {
  private static instance: Anthropic

  private constructor() { }

  public static getInstance(): Anthropic {
    if (!AnthropicClient.instance) {
      AnthropicClient.instance = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })
    }
    return AnthropicClient.instance
  }
}

export const anthropic = AnthropicClient.getInstance()
