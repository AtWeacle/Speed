import {
  type TreeItem,
  type TreeItemIndex,
} from 'react-complex-tree'

import {
  FILE_INDEX_STATUS,
} from '@weacle/speed-lib/constants'

export type ErrorsType = Record<string, string>

export type FileSystemItem = {
  name: string
  type: 'file' | 'directory'
  children?: FileSystemItem[]
}

export type CodeElement = {
  description: string
  keywords: string[]
  name: string
}

export type DirectoryTree = FileSystemItem
export type DirectoryTreeConverted = Record<TreeItemIndex, TreeItem<string>>

export type FileData = Pick<IndexedFile, 'components' | 'description' | 'functions' | 'keywords'>

export type FileIndex = {
  count: number
  status: FileIndexStatusType
}

export type FileIndexStatusType = typeof FILE_INDEX_STATUS[number]

export type FileSelectionPreset = {
  description?: string
  files: string[]
  id: string
  name: string
}

export type IndexedFile = {
  components: CodeElement[]
  description: string
  functions: CodeElement[]
  keywords: string[]
  path: string
  project: string
  vectorId: string
}

export type Message = {
  audio?: string
  id: string
  role: MessageRole
  status?: MessageStatus
  text?: string
}

export type MessageSystem = Omit<Message, 'role'> & {
  role: 'system'
}

export type MessageRole = 'system' | 'user'
export type MessageStatus = 'pending' | 'done' | 'error'
export type MessageType = 'error' | 'prompt' | 'response'

export type ModelVendor = 'anthropic' /* | 'google' | 'groq' */ | 'openai'

export type Models = {
  [key in ModelVendor]: {
    name: string
    list: {
      [modelId: string]: {
        /**
         * Context window size in characters
         */
        // contextWindow: number
        cost: {
          /**
           * Input Token price (Per Million Tokens)
           */
          input: number
          /**
           * Output Token price (Per Million Tokens)
           */
          output: number
        }
        label: string
      }
    }
  }
}

export type Project = {
  answering: boolean
  directoryPanelOpened: boolean
  directoryTree: DirectoryTree | null
  directoryTreeConverted: DirectoryTreeConverted | null
  errors: ErrorsType
  filesToExclude: string
  filesToInclude: string
  id: string
  messages: Message[]
  activeMessageId: string | null
  name: string
  pathsToExclude: string[]
  path: string
  prompt: string
  promptModel: LllModel
  selectedItems: string[]
  systemPrompt: string
}

export type SocketMessageBase = {
  status?: MessageStatus
  text?: string
  type: MessageType
}

export type SocketMessage =
  SocketMessagePrompt

export type SocketMessageResponse = {
  text: string
  status: MessageStatus
}

export type SocketMessareError = SocketMessageResponse & {
  status: 'error'
}

export type SocketMessagePromptResponse = SocketMessageResponse & {
  messageId: string
}

export type LllModel = {
  id: string
  name: string
  vendor: string
}

export type PathSettings = {
  filesToExclude: string
  filesToInclude: string
  pathsToExclude: string[]
}

export type SocketMessagePrompt = SocketMessageBase & {
  audio?: string
  directory: string
  messageId: string
  model: LllModel
  selectedItems: string[]
  settings: PathSettings
  systemPrompt: string
  type: 'prompt'
}
