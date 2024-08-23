import { customAlphabet } from 'nanoid'

export const nanoid = (length: number = 12): string =>
  customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length)()
