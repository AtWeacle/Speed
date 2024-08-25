import type {
  DirectoryTree,
  ErrorsType,
  FileSystemItem,
  LllModel,
  Message,
} from '@weacle/speed-lib/types'
import type {
  DirectoryTreeConverted,
} from '@weacle/speed-client/lib/types'


export type useStoreState = {
  answering: boolean
  setAnswering: (answering: boolean) => void

  directoryPanelOpened: boolean
  setDirectoryPanelOpened: (opened: boolean) => void

  directoryTree: DirectoryTree | null
  setDirectoryTree: (directoryTree: DirectoryTree) => void

  directoryTreeConverted: DirectoryTreeConverted | null
  setDirectoryTreeConverted: (directoryTreeConverted: DirectoryTreeConverted) => void

  errors: ErrorsType
  setErrors: (errors: ErrorsType) => void
  addError: (key: string, value: any) => void
  clearErrors: () => void
  removeError: (key: string) => void

  excludedFiles: string[]
  setExcludedFiles: (excludedFiles: string[]) => void

  messages: Message[]
  activeMessageId: string | null
  addMessage: (message: Omit<Message, 'id'> & { id?: string }) => void
  addSystemMessage: (text: string) => void
  clearMessages: () => void
  setActiveMessageId: (messageId: string) => void
  updateMessage: (messageId: string, update: Partial<Message>) => void

  projectDirectory: string
  setProjectDirectory: (projectDirectory: string) => void

  prompt: string
  setPrompt: (prompt: string) => void

  promptModel: LllModel
  setPromptModel: (model: LllModel) => void

  selectedItems: string[]
  addSelectedItem: (item: string) => void
  setSelectedItems: (items: string[]) => void
  clearSelectedItems: () => void
  selectAllItems: () => void

  systemPrompt: string
  setSystemPrompt: (systemPrompt: string) => void
  
  reset: () => void
}
