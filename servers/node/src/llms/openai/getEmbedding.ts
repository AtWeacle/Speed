import { openai } from '@weacle/speed-node-server/src/llms/openai/client'

async function getEmbedding(input: string, dimensions: number = 3072): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      input,
      model: 'text-embedding-3-large',
      dimensions,
    })
    
    if(!response?.data[0]?.embedding) {
      throw new Error(`Failed to get embedding.`)
    }

    return response.data[0].embedding
      
  } catch (error: any) {
    console.error('error', error)
    return null
  }
}

export default getEmbedding
