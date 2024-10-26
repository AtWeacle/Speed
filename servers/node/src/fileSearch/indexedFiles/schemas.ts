import { z } from 'zod'

export const codeElementSchema = z.object({
  description: z.string(),
  keywords: z.array(z.string()),
  name: z.string(),
})

export const fileDataSchema = z.object({
  components: z.array(codeElementSchema),
  description: z.string(),
  functions: z.array(codeElementSchema),
  keywords: z.array(z.string()),
})

export const indexedFileSchema = z.object({
  components: z.array(codeElementSchema),
  description: z.string(),
  functions: z.array(codeElementSchema),
  keywords: z.array(z.string()),
  path: z.string(),
  vectorId: z.string(),
})
