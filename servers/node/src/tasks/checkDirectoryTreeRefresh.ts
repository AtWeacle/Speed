import WebSocket from 'ws'
import { IncomingMessage } from 'http'

import { App } from '@weacle/speed-node-server/src/app/model'
import { REFRESH_DIRECTORY_TREE } from '@weacle/speed-lib/constants'

export default function checkFilesToUpdate(wsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>) {
  setInterval(async () => {
    const app = await App.findOne().lean().exec()
    if (!app?.directoryTree?.rebuild) return

    const builtAt = app.directoryTree.builtAt || new Date(0)

    const backThen = new Date(Date.now() - 10 * 1000)
    if (builtAt > backThen) return

    await App.updateOne({}, {
      $set: {
        'directoryTree.rebuild': false,
        'directoryTree.builtAt': new Date()
      },
    }).exec()

    const message = { type: REFRESH_DIRECTORY_TREE }
    wsServer.clients.forEach(ws => ws.readyState === ws.OPEN && ws.send(JSON.stringify(message)))
  }, 10 * 1000)
}
