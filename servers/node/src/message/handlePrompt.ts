import { WebSocket } from 'ws'
import path from 'path'

import type { SocketMessagePrompt, SocketMessareError, SocketMessageResponse } from '@weacle/speed-lib/types'

export default function handlePrompt(ws: WebSocket, message: SocketMessagePrompt) {
  try {
    const {
      text,
      // systemPrompt,
    } = message


  } catch (error) {
    const errorMessage: SocketMessareError = {
      status: 'error',
      text: `Error: ${error}`,
    }

    ws.send(JSON.stringify(errorMessage))
  }
}
