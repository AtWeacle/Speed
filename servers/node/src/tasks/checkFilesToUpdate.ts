import { App } from '@weacle/speed-node-server/src/app/model'
import updateIndexedFile from '@weacle/speed-node-server/src/fileSearch/updateIndexedFile'

export default function checkFilesToUpdate() {
  setInterval(async () => {
    const app = await App.findOne().lean().exec()
    if (!app?.filesUpdatedAt) return

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (app.filesUpdatedAt > thirtyMinutesAgo) return

    const filesToUpdate = app.filesToUpdate || []
    if (!filesToUpdate.length) return

    await App.updateOne({}, {
      $set: {
        filesToUpdate: [],
        filesUpdatedAt: new Date()
      }
    }).exec()

    for (const file of filesToUpdate) {
      await updateIndexedFile(file.project, file.path)
    }
  }, 5 * 60 * 1000)
}
