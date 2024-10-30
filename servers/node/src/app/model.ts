import mongoose, { Schema, Document, Model } from 'mongoose'

export type IStateBackupSchema = Document & {
  createdAt: Date
  state: string
  updatedAt: Date
}

export type IApp = Document & {
  createdAt: Date
  directoryTree: {
    builtAt: Date
    rebuild: boolean
  }
  filesToUpdate: {
    path: string
    project: string
  }[]
  filesUpdatedAt: Date
  state: string
  stateBackups?: IStateBackupSchema[]
  updatedAt: Date
}

const directoryTreeSchema = new mongoose.Schema({
  builtAt: {
    type: Date,
  },
  rebuild: {
    type: Boolean,
    default: false,
  },
}, { _id: false })

const fileToUpdateSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
}, { _id: false })

const stateBackupSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  }
}, { timestamps: true })

stateBackupSchema.index({  createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

const AppSchema = new Schema<IApp>({
  directoryTree: {
    type: directoryTreeSchema,
  },
  filesToUpdate: {
    type: [fileToUpdateSchema],
  },
  filesUpdatedAt: {
    type: Date,
  },
  state: {
    type: String,
  },
  stateBackups: {
    type: [stateBackupSchema],
  },
}, { timestamps: true })

AppSchema.index({ slug: 1 }, { unique: true })

export const App: Model<IApp> = mongoose.models.App
  || mongoose.model<IApp>('App', AppSchema)
