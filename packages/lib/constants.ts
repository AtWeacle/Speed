import type {
  Models,
} from '@weacle/speed-lib/types'

export const MODELS: Models = {
  anthropic: {
    name: 'Anthropic',
    list: [
      'claude-3-5-sonnet-20240620',
    ]
  },
  openai: {
    name: 'OpenAI',
    list: [
      'gpt-4o-2024-08-06',
      'gpt-4o-mini',
    ]
  },
}

export const DEFAULT_FILES_TO_EXCLUDE = ['node_modules', '.git', '.DS_Store', '.vscode', '.lock', 'pkg']
