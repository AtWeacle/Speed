import { ChromaClient } from 'chromadb'

const client = new ChromaClient({ path: 'http://localhost:4302' })
client.heartbeat()

export default client
