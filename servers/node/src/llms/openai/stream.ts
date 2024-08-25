import OpenAI, { APIError } from 'openai'

import {
  MODELS,
  openai,
} from '@weacle/speed-node-server/src/llms/openai/client'


type GetCompletionParams = {
  callback: (chunk: { content?: string | null, finishReason: CompletionFinishReason }) => void
  maxToken?: number
  model?: string
  prompt: string
  responseFormat?: { type: 'text' | 'json_object' }
  systemPrompt?: string
  temperature?: number
}

/**
 * @see https://platform.openai.com/docs/api-reference/chat/object
 */
type CompletionFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null

type ChatCompletionResponse = {
  errors: { stream: string } | null
}

export default async function stream({
  callback,
  maxToken,
  model = MODELS.gpt_4o,
  prompt,
  responseFormat,
  temperature = 0,
  systemPrompt,
}: GetCompletionParams): Promise<ChatCompletionResponse> {
  try {
    const systemMessage: OpenAI.ChatCompletionSystemMessageParam | null = systemPrompt ? {
      role: 'system',
      content: systemPrompt,
    } : null

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        ...(systemMessage ? [systemMessage] : []), {
        role: 'user',
        content: prompt,
      }],
      ...(maxToken ? { max_tokens: maxToken } : {}),
      ...(responseFormat ? { response_format: responseFormat } : {}),
      ...(temperature ? { temperature } : {}),
      stream: true,
      temperature: 0,
    })

    for await (const chunk of completion) {
      callback({
        content: chunk.choices[0].delta.content,
        finishReason: chunk.choices[0].finish_reason,
      })
    }
      
    return { errors: null }

  } catch (error) {
    if (error instanceof APIError) {
      console.error('OpenAI error in getCompletion:', JSON.stringify({
        error: error.message,
        code: error.code,
        status: error.status,
        type: error.type,
      }, null, 2))

    } else {
      console.error('getCompletion:', error)
    }

    return {
      errors: { stream: error.message || 'Failed to stream' },
    }
  }
}

