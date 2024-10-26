export type ErrorsType = Record<string, string>

export type FileSystemItem = {
  name: string
  type: 'file' | 'directory'
  children?: FileSystemItem[]
}

export type DirectoryTree = FileSystemItem

export type Message = {
  audio?: string
  id: string
  role: MessageRole
  status?: MessageStatus
  text?: string
}

export type MessageRole = 'system' | 'user'
export type MessageStatus = 'pending' | 'done' | 'error'
export type MessageType = 'error' | 'prompt' | 'response'

export type ModelVendor = 'anthropic' | 'google' | 'groq' | 'openai'

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
  modelId: string
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

export type MessageSystem = {
  role: 'system'
  status: 'pending'
}
