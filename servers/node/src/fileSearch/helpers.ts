import { zodResponseFormat } from 'openai/helpers/zod'

import type {
  CodeElement,
  FileData,
} from '@weacle/speed-lib/types'
import {
  fileDataSchema,
} from '@weacle/speed-node-server/src/fileSearch/indexedFiles/schemas'
import {
  MODELS,
  openai,
} from '@weacle/speed-node-server/src/llms/openai/client'


export function ensureLengthLimit(indexedFile: FileData): FileData {
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

export async function getFileData(content: string, filePath: string): Promise<FileData | null> {
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
