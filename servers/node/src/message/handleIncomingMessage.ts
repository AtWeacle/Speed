import { WebSocket } from 'ws'

import type { SocketMessage, SocketMessareError } from '@weacle/speed-lib/types'
import handlePrompt from '@weacle/speed-node-server/src/message/handlePrompt'

export default function handleIncomingMessage(ws: WebSocket, data: Buffer | ArrayBuffer | Buffer[]) {
  try {
    const message = JSON.parse(data.toString()) as SocketMessage
    console.log('Received message:', message)

    switch (message.type) {
      case 'prompt':
        handlePrompt(ws, message)
        break

      default:
        console.error('Unknown message type:', message.type)
    }
      
  } catch (error) {
    console.log('Error:', error)

    const errorMessage: SocketMessareError = {
      status: 'error',
      text: `Error: ${error}`,
    }

    ws.send(JSON.stringify(errorMessage))
  }
}
