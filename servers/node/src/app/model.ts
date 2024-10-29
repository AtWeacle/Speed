import mongoose, { Schema, Document, Model } from 'mongoose'


const stateBackupSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  }
}, { timestamps: true })

stateBackupSchema.index({  createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

export type IStateBackupSchema = Document & {
  createdAt: Date
  state: string
  updatedAt: Date
}

export type IApp = Document & {
  createdAt: Date
  state: string
  stateBackups?: IStateBackupSchema[]
  updatedAt: Date
}

const AppSchema = new Schema<IApp>({
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
