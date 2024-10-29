import { zodResponseFormat } from 'openai/helpers/zod'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'

import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import { Project } from '@weacle/speed-node-server/src/project/model'

import {
  fileDataSchema,
} from '@weacle/speed-node-server/src/fileSearch/indexedFiles/schemas'

import type {
  CodeElement,
  FileData,
  PathSettings,
} from '@weacle/speed-lib/types'

import {
  slugify,
} from '@weacle/speed-lib/utils/helpers'

import {
  DEFAULT_FILES_TO_EXCLUDE,
  DEFAULT_PATHS_TO_EXCLUDE,
} from '@weacle/speed-lib/constants'
import {
  MODELS,
  openai,
} from '@weacle/speed-node-server/src/llms/openai/client'

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME is required')
}

type FileList = {
  content: string
  path: string
}

type QueueItem = {
  content: string
  path: string
}

class Queue {
  private items: QueueItem[] = []
  private processing = 0
  private maxConcurrent: number
  private onComplete: () => void
  private processItem: (item: QueueItem) => Promise<void>

  constructor(maxConcurrent: number, processItem: (item: QueueItem) => Promise<void>, onComplete: () => void) {
    this.maxConcurrent = maxConcurrent
    this.processItem = processItem
    this.onComplete = onComplete
  }

  add(item: QueueItem) {
    this.items.push(item)
    this.processNext()
  }

  private async processNext() {
    if (this.processing >= this.maxConcurrent || this.items.length === 0) return

    this.processing++
    const item = this.items.shift()

    try {
      await this.processItem(item)
    } finally {
      this.processing--
      this.processNext()

      if (this.processing === 0 && this.items.length === 0) {
        this.onComplete()
      }
    }
  }
}

export default async function startIndexing(project: string, directory: string, settings?: PathSettings) {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)

  const projectSlug = slugify(project)

  const defaultSettings: PathSettings = {
    filesToExclude: '',
    filesToInclude: '*.ts,*.tsx',
    pathsToExclude: ['node_modules', 'dist', 'build', 'coverage', 'public', 'test', 'tests'],
  }

  const files = readFilesInPath(directory, settings || defaultSettings)

  let count = 0
  const total = files.length
  console.log('Total files:', total)

  await Project.updateOne({ slug: projectSlug }, { $set: {
    'fileIndex.status': 'indexing',
    'fileIndex.count': 0,
    'fileIndex.total': total,
  } })

  return new Promise<void>((resolve) => {
    const queue = new Queue(20, async ({ content, path }) => {
      count++

      try {
        if (!content) {
          const indexedFile = await IndexedFile.findOne({ path }).lean().exec()
          IndexedFile.deleteOne({ _id: indexedFile._id })
          index.deleteOne(indexedFile.vectorId)
          return
        }

        const indexedFile = await IndexedFile.findOne({ path }).lean().exec()
        if (indexedFile) return

        console.log('\t • Processing file:', path)

        const fileData = await getFileData(content, path)
        if (!fileData
          || !fileData.description
          || !fileData.keywords?.length
        ) return
          
        if (count % 10 === 0) {
          console.log('Processed', count, 'files')
          Project.updateOne({ slug: projectSlug }, { $set: {
            'fileIndex.processed': count,
          } })
        }

        const embedding = await getEmbedding(JSON.stringify(fileData))
        const vectorId = uuidv4()
        const ensuredFileData = ensureLengthLimit(fileData)

        IndexedFile.create({
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

        const recordChunks = chunks(records)

        await Promise.all(recordChunks.map((chunk) => index.namespace(projectSlug).upsert(chunk)))
        
      } catch (error) {
        console.error('Error processing file:', path, error)
      }
    }, async () => {
      await Project.updateOne({ slug: projectSlug }, { $set: { 
        'fileIndex.count': count,
        'fileIndex.status': 'idle',
      } })
      resolve()
    })

    files.forEach(file => queue.add(file))
  })
}
 
function chunks(array: any[], batchSize = 100) {
  const chunks = []

  for (let i = 0; i < array.length; i += batchSize) {
    chunks.push(array.slice(i, i + batchSize))
  }

  return chunks
}

function readFilesInPath(directory: string, settings: PathSettings) {
  const fileList: FileList[] = []

  function readDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath)
    const allExcludes = [...DEFAULT_FILES_TO_EXCLUDE, ...settings.filesToExclude.split(',')]
    const allPathExcludes = [...DEFAULT_PATHS_TO_EXCLUDE, ...settings.pathsToExclude]
    const filesToInclude = settings.filesToInclude.split(',')
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)

      const excludeThisPath = allPathExcludes
        .filter(p => !!p)
        .some(excludePath => {
          if (excludePath.startsWith('*')) {
            const pathToCheck = excludePath.slice(1)
            return filePath.includes(pathToCheck)
          }
          return filePath.startsWith(path.join(dirPath, excludePath))
        })

      if (excludeThisPath) {
        return
      }

      if (allExcludes.some(exclude => {
        if (exclude.startsWith('*')) {
          return file.endsWith(exclude.slice(1))
        }
        return file === exclude
      })) {
        return
      }

      if (stat.isDirectory()) {
        readDirectory(filePath)
      } else {
        if (!filesToInclude.some(include => {
          if (include.startsWith('*')) {
            return file.endsWith(include.slice(1))
          }
          return file.endsWith(include)
        })) {
          return
        }

        const fileContent = fs.readFileSync(filePath, 'utf8')
        fileList.push({ content: fileContent, path: filePath })
      }
    })
  }

  readDirectory(directory)
  return fileList
}

function ensureLengthLimit(indexedFile: FileData): FileData {
  function sliceArray(arr: any[], maxLength: number): any[] {
    return arr.slice(0, maxLength)
  }

  function processCodeElement(element: CodeElement): CodeElement {
    return {
      ...element,
      keywords: sliceArray(element.keywords, 20)
    }
  }

  return {
    ...indexedFile,
    keywords: sliceArray(indexedFile.keywords, 20),
    components: sliceArray(indexedFile.components, 30).map(processCodeElement),
    functions: sliceArray(indexedFile.functions, 100).map(processCodeElement)
  }
}

const getFileDataPrompt = (content: string, filePath: string) => `
What is the file about? Use the file content determine what's the file is about.
Return a JSON that contains the details about the files.
If there are some functions created in the file, write the list of important functions present in the file. Skip minor functions.
If there are some react components created in the file, write the list of important components present in the file. Skip minor components.

Json files in folder named "translations" are used to store translations for the application.

File path:
"${filePath}"

File content:
"${content}"
`

async function getFileData(content: string, filePath: string): Promise<FileData | null> {
  try {
    const prompt = getFileDataPrompt(content, filePath)

    const completion = await openai.beta.chat.completions.parse({
      model: MODELS.gpt_4o_mini,
      messages: [
        { role: 'user', content: prompt },
      ],
      response_format: zodResponseFormat(fileDataSchema, 'FileData'),
    })

    const response = completion.choices[0].message.parsed
    console.log('response', JSON.stringify(response, null, 2))

    return response as FileData || null

  } catch (error) {
    console.error('error', error)
    return null
  }
}
