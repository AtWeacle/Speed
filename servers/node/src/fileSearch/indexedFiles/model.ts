import mongoose, { Schema, Document, Model } from 'mongoose'

import type {
  CodeElement,
  IndexedFile as IndexedFileType,
} from '@weacle/speed-lib/types'

export type ICodeElement = Document & CodeElement 

export type IIndexedFile = Document & Omit<IndexedFileType, 'components' | 'functions'> & {
  components: ICodeElement[]
  functions: ICodeElement[]
}

const CodeElementSchema = new Schema<ICodeElement>({
  description: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { _id: false })

const IndexedFileSchema = new Schema<IIndexedFile>({
  components: {
    type: [CodeElementSchema],
  },
  description: {
    type: String,
    required: true,
  },
  functions: {
    type: [CodeElementSchema],
  },
  keywords: {
    type: [String],
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
  vectorId: {
    type: String,
    required: true,
  },
})

IndexedFileSchema.index({
  path: 1,
  project: 1,
}, { unique: true })

export const IndexedFile: Model<IIndexedFile> = mongoose.models.IndexedFile
  || mongoose.model<IIndexedFile>('IndexedFile', IndexedFileSchema)
