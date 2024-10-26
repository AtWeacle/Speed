import { zodResponseFormat } from 'openai/helpers/zod'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

import getEmbedding from '@weacle/speed-node-server/src/llms/openai/getEmbedding'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'
import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import {
  fileDataSchema,
} from '@weacle/speed-node-server/src/fileSearch/indexedFiles/schemas'

import type {
  FileData,
  PathSettings,
} from '@weacle/speed-lib/types'

import { DEFAULT_FILES_TO_EXCLUDE } from '@weacle/speed-lib/constants'
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

/**
 * @param directory Absolute path to the directory to index
 */
export default async function initIndex(directory: string) {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
    console.log('\n\n ====\n initIndex')

  const files = readFilesInPath(directory, {
    filesToExclude: '',
    filesToInclude: '*.ts,*.tsx',
    pathsToExclude: ['node_modules', 'dist', 'build', 'coverage', 'public', 'server', 'src', 'test', 'tests'],
  })

  let count = 0

  for (const { content, path } of files) {
    console.log('\t • Processing file:', path)

    const indexedFile = await IndexedFile.findOne({ path }).lean().exec()
    if (indexedFile) continue

    if (!content) {
      const indexedFile = await IndexedFile.findOne({ path }).lean().exec()
      IndexedFile.deleteOne({ _id: indexedFile._id })
      index.deleteOne(indexedFile.vectorId)
      continue
    }


    const fileData = await getFileData(content)
    if (!fileData) continue
      
    if (count++ % 10 === 0) {
      console.log('Processed', count, 'files')
    }

    const embedding = await getEmbedding(JSON.stringify(fileData))
    const vectorId = uuidv4()

    IndexedFile.create({
      ...fileData,
      path,
      vectorId,
    })

    const records = [{ 
      id: vectorId, 
      values: embedding, 
      metadata: { path }, 
    }]

    const recordChunks = chunks(records)

    await Promise.all(recordChunks.map((chunk) => index.upsert(chunk)))
  }
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
    const filesToInclude = settings.filesToInclude.split(',')
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      
      const excludeThisPath = settings.pathsToExclude
        .filter(p => !!p)
        .some(excludePath => filePath.startsWith(path.join(dirPath, excludePath)))

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
        // const relativePath = path.relative(directory, filePath)
        fileList.push({ content: fileContent, path: filePath })
      }
    })
  }

  readDirectory(directory)
  return fileList
}

const getFileDataPrompt = (content: string) => `
What is the file about? Use the file content determine what's the file is about.
Return a JSON that contains the details about the files.
If there are some functions created in the file, write the list of functions present in the file.
If there are some react components created in the file, write the list of components present in the file.

File content:
"${content}"

Return the title for the chat in a JSON object with the key "title".
`

async function getFileData(content: string): Promise<FileData | null> {
  try {
    const prompt = getFileDataPrompt(content)

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
