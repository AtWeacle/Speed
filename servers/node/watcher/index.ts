import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

import mongoConnect from '@weacle/speed-node-server/src/utils/mongoConnect'

// import handleIncomingMessage from '@weacle/speed-node-server/src/message/handleIncomingMessage'
import watchFiles from '@weacle/speed-node-server/src/fileSearch/watchFiles'


dotenv.config({ path: '../../.env' })

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
})

const PORT = process.env.SERVER_WATCHER_PORT || '8081'

wsServer.on('connection', (ws) => {
  ws.on('message', (data) => {
    // handleIncomingMessage(ws, data)
  })

  ws.on('disconnect', () => {
    console.log('User disconnected')
  })
})

httpServer.listen(PORT, async () => {
  console.log(`HTTP Watcher server is running on http://localhost:${PORT}`)
  console.log(`WebSocket Watcher server is running on ws://localhost:${PORT}`)

  await mongoConnect()
  watchFiles()
})
