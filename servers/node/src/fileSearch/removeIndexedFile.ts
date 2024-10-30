import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'
import { slugify } from '@weacle/speed-lib/utils/helpers'

export default async function removeIndexedFile(project: string, path: string): Promise<boolean> {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
  const projectSlug = slugify(project)
  const notRemoved = false
  const removed = true

  try {
    const indexedFile = await IndexedFile.findOne({ path, project: projectSlug }).lean().exec()
    if (!indexedFile) {
      console.log(' • Not removed. File not found in index:', path)
      return notRemoved
    }

    await IndexedFile.deleteOne({ _id: indexedFile._id })
    await index.namespace(projectSlug).deleteOne(indexedFile.vectorId)
    console.log('Removed file from index:', path)

    return removed

  } catch (error) {
    console.error('Error removing file:', path, error)
    return notRemoved
  }
}
