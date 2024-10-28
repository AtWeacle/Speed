import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import handleIncomingMessage from '@weacle/speed-node-server/src/message/handleIncomingMessage'
import getDirectoryTree from '@weacle/speed-node-server/src/utils/getDirectoryTree'
import initIndex from '@weacle/speed-node-server/src/fileSearch/initIndex'
import mongoConnect from '@weacle/speed-node-server/src/utils/mongoConnect'

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
  const directoryPath = req.query.directory as string
  const filesToExclude = req.query.filesToExclude as string
  const filesToInclude = req.query.filesToInclude as string
  const pathsToExclude = req.query.pathsToExclude as string[]

  const settings = { filesToExclude, filesToInclude, pathsToExclude }

  if (!directoryPath) {
    return res.status(400).json({ error: 'Directory path is required' })
  }

  try {
    const tree: DirectoryTree = getDirectoryTree(directoryPath, directoryPath, settings)
    res.json(tree)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/initIndex', (req, res) => {
  initIndex('')
app.get('/api/file-index/search', async (req, res) => {
  const search = req.query.search as string
  const paths = await searchFiles(search)
  res.json({ paths })
})
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

  await mongoConnect()
  initIndex(process.env.PROJECT_DIR)
})
