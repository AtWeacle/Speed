import { z } from 'zod'
import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'
import { IndexedFile, IIndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import {
  slugify,
} from '@weacle/speed-node-server/src/utils/helpers'
import {
  MODELS,
  openai,
} from '@weacle/speed-node-server/src/llms/openai/client'
import { zodResponseFormat } from 'openai/helpers/zod'

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME is required')
}

const USE_LLM = false

const fileIdsResponseSchema = z.object({
  fileIds: z.array(z.string())
})

const getRelevantFilesPrompt = (searchText: string, files: IIndexedFile[]) => `
Given the search text and the list of files, return the most relevant file IDs ordered by relevance.
Only return the IDs of files that are relevant to the search text.

Search text:
"${searchText}"

Files:
${JSON.stringify(files, null, 2)}
`

export default async function searchFiles(project: string, searchText: string): Promise<string[]> {
  try {
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
    const embedding = await getEmbedding(searchText)
    const projectSlug = slugify(project)

    const vectors = await index.namespace(projectSlug).query({
      includeMetadata: true,
      topK: 15,
      vector: embedding,
    })

    const filePaths = vectors.matches.map((vector) => vector.metadata.path) as string[]
    if (!USE_LLM) return filePaths

    const indexedFiles = await IndexedFile.find({ path: { $in: filePaths } })
      .select({ _id: 1, components: 1, description: 1, functions: 1, keywords: 1, path: 1 })
      .lean<IIndexedFile[]>().exec()

    const completion = await openai.beta.chat.completions.parse({
      model: MODELS.gpt_4o,
      messages: [
        { role: 'user', content: getRelevantFilesPrompt(searchText, indexedFiles) },
      ],
      response_format: zodResponseFormat(fileIdsResponseSchema, 'FileIds'),
    })

    const fileIds = completion.choices[0].message.parsed.fileIds
    const paths = fileIds
      .map((fileId) => indexedFiles.find((file) => file._id.toString() === fileId)?.path)
      .filter(Boolean) as string[]

    return paths

  } catch (error) {
    console.error('error', error)
    return []
  }
}
