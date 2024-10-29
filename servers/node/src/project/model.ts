import mongoose, { Schema, Document, Model } from 'mongoose'

import type {
  FileIndexStatusType,
} from '@weacle/speed-lib/types'
import {
  DEFAULT_FILES_TO_EXCLUDE,
  DEFAULT_FILES_TO_INCLUDE,
  DEFAULT_PATHS_TO_EXCLUDE,
  FILE_INDEX_STATUS,
} from '@weacle/speed-lib/constants'

export type IProjectSettings = Document & {
  filesToExclude: string[]
  filesToInclude: string[]
  pathsToExclude: string[]
}

export type IProject = Document & {
  fileIndex: {
    count: number
    status: FileIndexStatusType
  }
  initiated: boolean
  name: string
  path: string
  settings: IProjectSettings
  slug: string
}

const ProjectSettingsSchema = new Schema<IProjectSettings>({
  filesToExclude: {
    type: [String],
    default: DEFAULT_FILES_TO_EXCLUDE,
    required: true,
  },
  filesToInclude: {
    type: [String],
    default: DEFAULT_FILES_TO_INCLUDE,
    required: true,
  },
  pathsToExclude: {
    type: [String],
    default: DEFAULT_PATHS_TO_EXCLUDE,
    required: true,
  },
}, { timestamps: true, _id: false })

const ProjectSchema = new Schema<IProject>({
  fileIndex: {
    count: {
      type: Number,
      default: 0,
      required: true,
    },
    initiated: {
      type: Boolean,
      default: false,
    },
    processed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: FILE_INDEX_STATUS,
      default: 'idle',
      required: true,
    },
    total: {
      type: Number,
      default: 0,
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
  settings: {
    type: ProjectSettingsSchema,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
}, { timestamps: true })

ProjectSchema.index({ slug: 1 }, { unique: true })

export const Project: Model<IProject> = mongoose.models.Project
  || mongoose.model<IProject>('Project', ProjectSchema)
