import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

import mongoConnect from '@weacle/speed-node-server/src/utils/mongoConnect'

import handleIncomingMessage from '@weacle/speed-node-server/src/message/handleIncomingMessage'
import getDirectoryTree from '@weacle/speed-node-server/src/utils/getDirectoryTree'
import initIndex from '@weacle/speed-node-server/src/fileSearch/initIndex'
import searchFiles from '@weacle/speed-node-server/src/fileSearch/searchFiles'

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

app.post('/api/file/open', (req, res) => {
  const filePath = req.query.path as string
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' })
  }

  try {
    const command = process.platform === 'win32' ? 'start' : 'open'
    require('child_process').exec(`${command} "${filePath}"`)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/file-index/search', async (req, res) => {
  const search = req.query.search as string
  const project = req.query.project as string
  const paths = await searchFiles(project, search)
  res.json({ paths })
})

app.post('/api/file-index/init', (req, res) => {
  const directory = req.query.directory as string
  const project = req.query.project as string
  if (project && directory) initIndex(project, directory)
  res.json({ message: 'Indexing started' })
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
})
