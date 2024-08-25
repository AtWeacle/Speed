export type ErrorsType = Record<string, string>

export type Message = {
  audio?: string
  id: string
  role: MessageRole
  status?: MessageStatus
  text?: string
}

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

export type MessageRole = 'system' | 'user'
export type MessageStatus = 'pending' | 'done' | 'error'
export type MessageType = 'error' | 'prompt' | 'response'

export type SocketMessageResponse = {
  text: string
  status: MessageStatus
}

export type SocketMessareError = SocketMessageResponse & {
  status: 'error'
}

export type LllModel = {
  name: string
  vendor: string
}

export type SocketMessagePrompt = SocketMessageBase & {
  audio?: string
  model: LllModel
  systemPrompt: string
  type: 'prompt'
}

export type MessageSystem = {
  role: 'system'
  status: 'pending'
}
