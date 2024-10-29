import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'

import {
  ensureLengthLimit,
  getFileData,
} from '@weacle/speed-node-server/src/fileSearch/helpers'
import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import { slugify } from '@weacle/speed-lib/utils/helpers'

export default async function indexFile(project: string, path: string) {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
  const projectSlug = slugify(project)

  try {
    const content = fs.readFileSync(path, 'utf8')
    if (!content) {
      console.error(' • Not indexed. File content is empty:', path)
      return
    }

    const indexedFile = await IndexedFile.findOne({ path, project: projectSlug }).lean().exec()
    if (indexedFile) {
      console.log(' • Not indexed. File already indexed:', path)
      return
    }

    const fileData = await getFileData(content, path)
    if (!fileData || !fileData.description || !fileData.keywords?.length) {
      console.error(' • Not indexed. No file data:', path)
      return
    }

    const embedding = await getEmbedding(JSON.stringify(fileData))
    const vectorId = uuidv4()
    const ensuredFileData = ensureLengthLimit(fileData)

    await IndexedFile.create({
      ...ensuredFileData,
      path,
      project: projectSlug,
      vectorId,
    })

    const records = [{
      id: vectorId, 
      values: embedding, 
      metadata: { path }, 
    }]

    await index.namespace(projectSlug).upsert(records)
    console.log('Added file in index:', path)

  } catch (error) {
    console.error('Error processing file:', path, error)
  }
}
