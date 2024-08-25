import type {
  ErrorsType,
  Message,
} from '@weacle/speed-lib/types'


export type useStoreState = {
  answering: boolean
  setAnswering: (answering: boolean) => void

  directoryPanelOpened: boolean
  setDirectoryPanelOpened: (opened: boolean) => void

  errors: ErrorsType
  setErrors: (errors: ErrorsType) => void
  addError: (key: string, value: any) => void
  clearErrors: () => void
  removeError: (key: string) => void

  messages: Message[]
  activeMessageId: string | null
  addMessage: (message: Omit<Message, 'id'> & { id?: string }) => void
  addSystemMessage: (text: string) => void
  clearMessages: () => void
  setActiveMessageId: (messageId: string) => void
  updateMessage: (messageId: string, update: Partial<Message>) => void

  prompt: string
  setPrompt: (prompt: string) => void

  systemPrompt: string
  setSystemPrompt: (systemPrompt: string) => void
  
  reset: () => void
}
