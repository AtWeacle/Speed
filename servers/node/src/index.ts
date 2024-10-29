import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import os from 'os'
import { exec } from 'child_process'
import bodyparser from 'body-parser'
import fs from 'fs'

import mongoConnect from '@weacle/speed-node-server/src/utils/mongoConnect'
import { App } from '@weacle/speed-node-server/src/app/model'
import { Project } from '@weacle/speed-node-server/src/project/model'

import handleIncomingMessage from '@weacle/speed-node-server/src/message/handleIncomingMessage'
import getDirectoryTree from '@weacle/speed-node-server/src/utils/getDirectoryTree'
import startIndexing from '@weacle/speed-node-server/src/fileSearch/startIndexing'
import searchFiles from '@weacle/speed-node-server/src/fileSearch/searchFiles'
import watchFiles from '@weacle/speed-node-server/src/fileSearch/watchFiles'

import type {
  DirectoryTree,
} from '@weacle/speed-lib/types'
import { slugify } from '@weacle/speed-node-server/src/utils/helpers'

dotenv.config({ path: '../../.env' })

const app = express()
const CODING_APP = 'Visual Studio Code'

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(bodyparser.json({ limit: '100mb' }))
app.use(bodyparser.urlencoded({ extended: true }))

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

app.get('/api/app/state', async (req, res) => {
  const app = await App.findOne().lean().exec()

  if (!app?.state) {
    return res.status(404).json({ error: 'App state not found' })
  }

  res.json({ state: app.state || {} })
})

app.post('/api/app/backup', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' })
  }

  const { state } = req.body

  if (!state) {
    return res.status(400).json({ error: 'State is required' })
  }

  try {
    await App.updateOne({}, {
      $addToSet: {
        stateBackups: { state }
      },
    }, { upsert: true })
    res.json({ success: true })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
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
    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
      return res.status(400).json({ error: 'File does not exist or is a directory' })
    }

    if (os.platform() === 'darwin') {
      /**
       * Trigger the default app for opening the file on macOS
       * without changing the file which will trigger a watcher to restart the server.
       * The "open" command will change the file and trigger the watcher.
       */
      exec(`osascript -e 'tell application "${CODING_APP}" to open POSIX file "${filePath}"'`)

    } else if (os.platform() === 'win32' || os.platform() === 'linux') {
      exec(`open "${filePath}"`)
    }

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

app.post('/api/file-index/start', (req, res) => {
  const directory = req.query.directory as string
  const project = req.query.project as string
  const filesToExclude = req.query.filesToExclude as string
  const filesToInclude = req.query.filesToInclude as string
  const pathsToExclude = (req.query.pathsToExclude as string)?.split(',') as string[]

  const settings = { filesToExclude, filesToInclude, pathsToExclude }

  if (project && directory) startIndexing(project, directory, settings)
  res.json({ message: 'Indexing started' })
})

app.post('/api/project', async (req, res) => {
  const { name, path } = req.query

  if (!name || !path) {
    return res.status(400).json({ error: 'Name, path and slug are required' })
  }

  try {
    const project = new Project({
      fileIndex: {
        count: 0,
        status: 'idle'
      },
      name,
      path,
      slug: slugify(name as string),
    })

    await project.save()
    res.json(project)

  } catch (error) {
    res.status(500).json({ error: error.message })
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

  await mongoConnect()
  // watchFiles()
})
