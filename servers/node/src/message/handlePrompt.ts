import { WebSocket } from 'ws'
import path from 'path'

import anthropicStream from '@weacle/speed-node-server/src/llms/anthropic/stream'
import openaiStream from '@weacle/speed-node-server/src/llms/openai/stream'
import type { SocketMessagePrompt, SocketMessareError, SocketMessageResponse } from '@weacle/speed-lib/types'

export default function handlePrompt(ws: WebSocket, message: SocketMessagePrompt) {
  try {
    const {
      text,
      // systemPrompt,
    } = message

    anthropicStream({
      callback: ({ content, finishReason }) => {
        if (content) {
          const message: SocketMessageResponse = {
            status: 'pending',
            text: content,
          }

          ws.send(JSON.stringify(message))
        }

        if (finishReason) {
          const message: SocketMessageResponse = {
            status: 'done',
            text: '',
          }

          ws.send(JSON.stringify(message))
        }
      },
      // systemPrompt,
      prompt: text,
      // prompt: assemblePrompt(prompt),
      // prompt: getPrompt('Generate the mongoose model of staff'),
    })

  } catch (error) {
    const errorMessage: SocketMessareError = {
      status: 'error',
      text: `Error: ${error}`,
    }

    ws.send(JSON.stringify(errorMessage))
  }
}
