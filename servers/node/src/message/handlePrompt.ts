import { WebSocket } from 'ws'
import path from 'path'
import fs from 'fs'

import anthropicStream from '@weacle/speed-node-server/src/llms/anthropic/stream'
import openaiStream from '@weacle/speed-node-server/src/llms/openai/stream'
import type { SocketMessagePrompt, SocketMessareError, SocketMessagePromptResponse } from '@weacle/speed-lib/types'

export default function handlePrompt(ws: WebSocket, message: SocketMessagePrompt) {
  try {
    const {
      directory,
      messageId,
      model,
      selectedItems,
      text,
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
        model: model.name,
        systemPrompt,
        prompt: assemblePrompt(text, directory, selectedItems),
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
        model: model.name,
        prompt: assemblePrompt(text, directory, selectedItems),
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

function assemblePrompt(userPrompt: string, directory: string, selectedItems: string[]) {
  const filesContents = assembleFiles(directory, selectedItems)
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

function assembleFiles(directory: string, selectedItems: string[]): string {
  const paths = selectedItems.map(item => path.join(directory, item.replace('root', '')))

  const filesContent = paths.map(path => {
    const stat = fs.statSync(path)
    if (stat.isDirectory()) {
      return readFilesInPath(directory, path)
    } else {
      return readFileContent(directory, path)
    }
  }).join('\n\n')

  return filesContent
}

function readFilesInPath(directory: string, dirPath: string) {
  let structuredContent = ''

  function readDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath)

    // if (pathToExclude.includes(dirPath)
    //   || otherPathToExclude.includes(dirPath)
    // ) {
    //   return
    // }
    
    files.forEach(file => {
      if (path.extname(file) === '.json'
        || file === 'node_modules'
        || file === '.next'
        || file === '.env'
      ) {
        return
      }

      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        if (file !== 'node_modules') {
          readDirectory(filePath)
        }
      } else {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const relativePath = path.relative(directory, filePath)
        // structuredContent += `### File used on ${device} side ###\n`
        structuredContent += `### File: ${relativePath} ###\n\n${fileContent}\n\n`
      }
    })
  }

  readDirectory(dirPath)
  return structuredContent
}

function readFileContent(directory: string, filePath: string) {
  let structuredContent = ''

  try {
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      throw new Error('The provided path is a directory, not a file.')
    } else {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const relativePath = path.relative(directory, filePath)
      // structuredContent += `### File used on ${device} side ###\n`
      structuredContent += `### File: ${relativePath} ###\n\n${fileContent}\n\n`
    }
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error.message)
  }

  return structuredContent
}

// function removeComments(content: string): string {
//   const lines = content.split('\n')
//   const uncommentedLines = lines.filter(line => !line.trim().startsWith('//'))
//   return uncommentedLines.join('\n')
// }
