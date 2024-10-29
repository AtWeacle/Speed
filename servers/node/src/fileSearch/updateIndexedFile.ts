import fs from 'fs'

import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'

import {
  ensureLengthLimit,
  getFileData,
} from '@weacle/speed-node-server/src/fileSearch/helpers'
import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import { slugify } from '@weacle/speed-lib/utils/helpers'
import indexFile from '@weacle/speed-node-server/src/fileSearch/indexFile'

export default async function updateIndexedFile(project: string, path: string) {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
  const projectSlug = slugify(project)

  try {
    const indexedFile = await IndexedFile.findOne({ path, project: projectSlug }).lean().exec()
    if (!indexedFile) {
      return indexFile(project, path)
    }

    const content = fs.readFileSync(path, 'utf8')
    if (!content) {
      console.error(' • Not updated. File content is empty:', path)
      return
    }

    const fileData = await getFileData(content, path)
    if (!fileData || !fileData.description || !fileData.keywords?.length) {
      console.error(' • Not updated. No file data:', path)
      return
    }

    const embedding = await getEmbedding(JSON.stringify(fileData))
    const ensuredFileData = ensureLengthLimit(fileData)

    await IndexedFile.updateOne(
      { _id: indexedFile._id },
      { $set: ensuredFileData }
    )

    await index.namespace(projectSlug).update({
      id: indexedFile.vectorId,
      values: embedding,
      metadata: { path },
    })

    console.log('Updated file in index:', path)

  } catch (error) {
    console.error('Error updating file:', path, error)
  }
}