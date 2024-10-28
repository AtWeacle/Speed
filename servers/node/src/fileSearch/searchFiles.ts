import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'
// import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME is required')
}

/**
 * @param directory Absolute path to the directory to index
 */
export default async function searchFiles(searchText: string): Promise<string[]> {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
  const embedding = await getEmbedding(searchText)

  const vectors = await index.namespace('').query({
    includeMetadata: true,
    topK: 20,
    vector: embedding,
  })

  // const indexedFile = await IndexedFile.findOne({ path }).lean().exec()
  const filePaths = vectors.matches.map((vector) => vector.metadata.path) as string[]
  return filePaths
}
