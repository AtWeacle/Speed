import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import handleIncomingMessage from '@weacle/speed-node-server/src/message/handleIncomingMessage'
import getDirectoryTree from '@weacle/speed-node-server/src/utils/getDirectoryTree'

import type {
  DirectoryTree,
} from '@weacle/speed-lib/types'

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

app.get('/api/directory-tree', (req, res) => {
  const directoryPath = req.query.path as string
  const excludes = (req.query.excludes as string || '').split(',')

  if (!directoryPath) {
    return res.status(400).json({ error: 'Directory path is required' })
  }

  try {
    const tree: DirectoryTree = getDirectoryTree(directoryPath, excludes)
    res.json(tree)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get directory tree' })
  }
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
