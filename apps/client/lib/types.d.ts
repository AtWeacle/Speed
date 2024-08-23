export type ErrorsType = Record<string, string>

export type MessageStatus = 'pending' | 'done' | 'error'

export type Message = {
  audio?: string
  id: string
  files?: FileType[]
  status?: MessageStatus
  text?: string
  type: MessageType
}

export type MessageType = 'system' | 'user'
