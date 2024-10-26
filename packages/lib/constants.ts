import type {
  LllModel,
  Models,
} from '@weacle/speed-lib/types'

export const defaultModel: LllModel = {
  id: 'claude-3-5-sonnet-20241022',
  name: 'Claude 3.5 Sonnet',
  vendor: 'anthropic',
}

export const MODELS: Models = {
  /**
   * https://www.anthropic.com/pricing#anthropic-api
   * https://docs.anthropic.com/en/docs/about-claude/models
   */
  anthropic: {
    name: 'Anthropic',
    list: {
      'claude-3-5-sonnet-20241022': {
        // contextWindow: 680000,
        cost: { input: 3.0, output: 15.0 },
        label: 'Claude 3.5 Sonnet',
      },
      // 'claude-3-5-haiku-latest': {
      //   cost: { input: 0.25, output: 1.25 },
      //   label: 'Claude 3.5 Haiku',
      // },
    },
  },
  /**
   * https://ai.google.dev/pricing#1_5flash
   */
  google: {
    name: 'Google',
    list: {
      'gemini-1.5-pro-002': {
        cost: { input: 1.25, output: 5.00 },
        /**
         * Prompts longer than 128k
         * cost: { input: 2.50, output: 10.0 },
         */
        label: 'Gemini 1.5 Pro',
      },
      'gemini-1.5-flash-002': {
        cost: { input: 0.075, output: 0.30 },
        /**
         * Prompts longer than 128k
         * cost: { input: 0.15, output: 0.60 },
         */
        label: 'Gemini 1.5 Flash',
      },
    },
  },
  /**
   * https://console.groq.com/docs/models
   */
  groq: {
    name: 'Groq',
    list: {
      'llama-3.1-70b-versatile': {
        cost: { input: 0.59, output: 0.79 },
        label: 'Llama 3.1 70B',
      },
      'llama-3.1-8b-instant': {
        cost: { input: 0.05, output: 0.08 },
        label: 'Llama 3.1 8B',
      },
      // 'llama3-groq-70b-8192-tool-use-preview': {
      //   cost: { input: 0.89, output: 0.89 },
      //   label: 'Llama 3 Groq 70B Tool Use Preview 8k',
      // },
      // 'llama3-groq-8b-8192-tool-use-preview': {
      //   cost: { input: 0.19, output: 0.19 },
      //   label: 'Llama 3.1 8B',
      // },
    },
  },
  /**
   * https://openai.com/pricing
   */
  openai: {
    name: 'OpenAI',
    list: {
      'gpt-4o-2024-08-06': {
        cost: { input: 2.50, output: 10.0 },
        label: 'GPT-4o',
      },
      'gpt-4o-mini-2024-07-18': {
        cost: { input: 0.150, output: 0.600 },
        label: 'GPT-4o Mini',
      },
    },
  },
}

export const MODEL_IDS = Object.values(MODELS).reduce((acc, vendor) => {
  return acc.concat(Object.keys(vendor.list))
}, [] as string[])

export const DEFAULT_FILES_TO_EXCLUDE = ['node_modules', '.git', '.DS_Store', '.vscode', '.lock', 'pkg']
