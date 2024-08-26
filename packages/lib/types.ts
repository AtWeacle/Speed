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

export type ModelVendor = 'anthropic' | 'openai'

export type Models = {
  [key in ModelVendor]: {
    name: string
    list: string[]
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
  name: string
  vendor: string
}

export type SocketMessagePrompt = SocketMessageBase & {
  audio?: string
  directory: string
  messageId: string
  model: LllModel
  selectedItems: string[]
  systemPrompt: string
  type: 'prompt'
}

export type MessageSystem = {
  role: 'system'
  status: 'pending'
}
