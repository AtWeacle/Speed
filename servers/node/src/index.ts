import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
// import path from 'path'
import { WebSocketServer } from 'ws'

dotenv.config({ path: '../../.env' })

const app = express()

app.use((req: any, res: any, next: any) => {
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

wsServer.on('connection', (ws: any) => {
  ws.on('message', (data: any) => {
    try {
      const message = data.toString()
      console.log('Received message:', message)

      ws.send(JSON.stringify({
        type: 'response',
        text: `Server received: ${message}`,
        status: 'done',
      }))
      
    } catch (error) {
      console.log('Error:', error)
    }
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
})
