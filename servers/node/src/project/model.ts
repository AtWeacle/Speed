import mongoose, { Schema, Document, Model } from 'mongoose'

import type {
  FileIndexStatusType,
} from '@weacle/speed-lib/types'
import {
  FILE_INDEX_STATUS,
} from '@weacle/speed-lib/constants'

const stateBackupSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  }
}, { timestamps: true })

stateBackupSchema.index({  createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

export type IStateBackupSchema = Document & {
  state: string
}

export type IProject = Document & {
  fileIndex: {
    count: number
    status: FileIndexStatusType
  }
  name: string
  path: string
  slug: string
  stateBackups?: IStateBackupSchema[]
}

const ProjectSchema = new Schema<IProject>({
  fileIndex: {
    count: {
      type: Number,
      default: 0,
      required: true,
    },
    status: {
      type: String,
      enum: FILE_INDEX_STATUS,
      default: 'idle',
      required: true,
    },
  },
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  stateBackups: {
    type: [stateBackupSchema],
  },
}, { timestamps: true })

ProjectSchema.index({ slug: 1 }, { unique: true })

export const Project: Model<IProject> = mongoose.models.Project
  || mongoose.model<IProject>('Project', ProjectSchema)