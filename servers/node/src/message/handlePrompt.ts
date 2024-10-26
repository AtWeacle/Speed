import { WebSocket } from 'ws'
import path from 'path'
import fs from 'fs'

import anthropicStream from '@weacle/speed-node-server/src/llms/anthropic/stream'
import openaiStream from '@weacle/speed-node-server/src/llms/openai/stream'

import type {
  PathSettings,
  SocketMessagePrompt,
  SocketMessareError,
  SocketMessagePromptResponse,
} from '@weacle/speed-lib/types'
import { DEFAULT_FILES_TO_EXCLUDE } from '@weacle/speed-lib/constants'

export default function handlePrompt(ws: WebSocket, message: SocketMessagePrompt) {
  try {
    const {
      directory,
      messageId,
      model,
      selectedItems,
      text,
      settings,
      systemPrompt,
    } = message

    if (model.vendor === 'anthropic') {
      anthropicStream({
        callback: ({ content, finishReason }) => {
          if (content) {
            sendResponse({
              messageId,
              status: 'pending',
              text: content,
            })
          }

          if (finishReason) {
            endResponse()
          }
        },
        model: model.id,
        systemPrompt,
        prompt: assemblePrompt(text, directory, selectedItems, settings),
      })

    } else if (model.vendor === 'openai') {
      openaiStream({
        callback: ({ content, finishReason }) => {
          if (content) {
            sendResponse({
              messageId,
              status: 'pending',
              text: content,
            })
          }

          if (finishReason) {
            endResponse()
          }
        },
        systemPrompt,
        model: model.id,
        prompt: assemblePrompt(text, directory, selectedItems, settings),
      })
    }

    function sendResponse(response: SocketMessagePromptResponse) {
      ws.send(JSON.stringify(response))
    }

    function endResponse() {
      const response: SocketMessagePromptResponse = {
        messageId,
        status: 'done',
        text: '',
      }

      ws.send(JSON.stringify(response))
    }

  } catch (error) {
    const errorMessage: SocketMessareError = {
      status: 'error',
      text: `Error: ${error}`,
    }

    ws.send(JSON.stringify(errorMessage))
  }
}

function assemblePrompt(userPrompt: string, directory: string, selectedItems: string[], settings: PathSettings) {
  const filesContents = assembleFiles(directory, selectedItems, settings)
  return getPrompt(userPrompt, filesContents)
}

function getPrompt(userPrompt: string, filesContents: string) {
  return `
From the given user prompt, generate the relevant code based on the existing code.

User prompt: ${userPrompt}

Part of the existing code is provided below.
List of some existing files and their contents:
${filesContents}
`
}

function assembleFiles(directory: string, selectedItems: string[], settings: PathSettings): string {
  const paths = selectedItems.map(item => path.join(directory, item.replace('root', '')))

  const filesContent = paths.map(path => {
    const stat = fs.statSync(path)
    if (stat.isDirectory()) {
      return readFilesInPath(directory, path, settings)
    } else {
      return readFileContent(directory, path, settings)
    }
  }).join('\n\n')

  return filesContent
}

function readFilesInPath(directory: string, dirPath: string, settings: PathSettings) {
  let structuredContent = ''

  function readDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath)
    const allExcludes = [...DEFAULT_FILES_TO_EXCLUDE, ...settings.filesToExclude.split(',')]
    const filesToInclude = settings.filesToInclude.split(',')
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      
      const excludeThisPath = settings.pathsToExclude
        .filter(p => !!p)
        .some(excludePath => filePath.startsWith(path.join(directory, excludePath)))

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
        const relativePath = path.relative(directory, filePath)
        structuredContent += `### File: ${relativePath} ###\n\n${fileContent}\n\n`
      }
    })
  }

  readDirectory(dirPath)
  return structuredContent
}

function readFileContent(directory: string, filePath: string, settings: PathSettings) {
  let structuredContent = ''

  try {
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      throw new Error('The provided path is a directory, not a file.')
    } else {
      const fileName = path.basename(filePath)
      const filesToInclude = settings.filesToInclude.split(',')

      if (!filesToInclude.some(include => {
        if (include.startsWith('*')) {
          return fileName.endsWith(include.slice(1))
        }
        return fileName.endsWith(include)
      })) {
        return ''
      }

      const fileContent = fs.readFileSync(filePath, 'utf8')
      const relativePath = path.relative(directory, filePath)
      structuredContent += `### File: ${relativePath} ###\n\n${fileContent}\n\n`
    }
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error.message)
  }

  return structuredContent
}
