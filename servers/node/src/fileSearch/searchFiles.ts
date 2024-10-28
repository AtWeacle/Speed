import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'
import {
  slugify,
} from '@weacle/speed-node-server/src/utils/helpers'

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME is required')
}

/**
 * @param directory Absolute path to the directory to index
 */
export default async function searchFiles(project: string, searchText: string): Promise<string[]> {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
  const embedding = await getEmbedding(searchText)
  const projectSlug = slugify(project)

  const vectors = await index.namespace(projectSlug).query({
    includeMetadata: true,
    topK: 20,
    vector: embedding,
  })

  const filePaths = vectors.matches.map((vector) => vector.metadata.path) as string[]
  return filePaths
}
