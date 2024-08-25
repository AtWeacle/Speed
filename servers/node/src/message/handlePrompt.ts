import { WebSocket } from 'ws'
import path from 'path'

import anthropicStream from '@weacle/speed-node-server/src/llms/anthropic/stream'
import openaiStream from '@weacle/speed-node-server/src/llms/openai/stream'
import type { SocketMessagePrompt, SocketMessareError, SocketMessageResponse } from '@weacle/speed-lib/types'

export default function handlePrompt(ws: WebSocket, message: SocketMessagePrompt) {
  try {
    const {
      model,
      text,
      systemPrompt,
    } = message

    if (model.vendor === 'anthropic') {
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
        model: model.name,
        prompt: text,
        systemPrompt,
        // prompt: assemblePrompt(prompt),
      })

    } else if (model.vendor === 'openai') {
      openaiStream({
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
        systemPrompt,
        prompt: text,
        model: model.name,
        // prompt: assemblePrompt(prompt),
      })
    }

  } catch (error) {
    const errorMessage: SocketMessareError = {
      status: 'error',
      text: `Error: ${error}`,
    }

    ws.send(JSON.stringify(errorMessage))
  }
}
