import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import handleIncomingMessage from '@weacle/speed-node-server/src/message/handleIncomingMessage'

dotenv.config({ path: '../../.env' })

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
})

const PORT = process.env.SERVER_PORT || '8080'

wsServer.on('connection', (ws) => {
  ws.on('message', (data) => {
    handleIncomingMessage(ws, data)
  })

  ws.on('disconnect', () => {
    console.log('User disconnected')
  })
})

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' })
})

httpServer.listen(PORT, async () => {
  console.log(`HTTP server is running on http://localhost:${PORT}`)
  console.log(`WebSocket server is running on ws://localhost:${PORT}`)

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set')
    process.exit(1)
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set')
    process.exit(1)
  }
})
