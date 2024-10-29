import fs from 'fs'
import chokidar from 'chokidar'
import pinecone from '@weacle/speed-node-server/src/fileSearch/pinecone/client'

import { IndexedFile } from '@weacle/speed-node-server/src/fileSearch/indexedFiles/model'
import { Project } from '@weacle/speed-node-server/src/project/model'

export async function removeFileIndex(projectName: string, path: string) {
  console.log('Removing file index:', path)
}

export async function updateFileIndex(projectName: string, path: string) {
  console.log('Updating file index:', path)
}

export async function addFileIndex(projectName: string, path: string) {
  console.log('Adding file index:', path)
}

export default async function watchFiles() {
  const projects = await Project.find({
    'fileIndex.initiated': true
  }).lean().exec()

  projects.forEach(project => {
    const { filesToExclude, filesToInclude, pathsToExclude } = project.settings

    const watcher = chokidar.watch(project.path, {
      awaitWriteFinish: true,
      ignored: (path, stats) => {
        if (pathsToExclude.filter(p => !!p).some(p => path.includes('/' + p + '/'))) return true
        if (fs.lstatSync(path).isDirectory()) return false
        if (filesToExclude.filter(f => !!f).some(f => path.endsWith(f))) return true
        if (!filesToInclude.filter(f => !!f).some(f => path.endsWith(f))) return true
        return false
      },
      ignoreInitial: true,
      persistent: true
    })

    watcher
      .on('unlink', path => removeFileIndex(project.name, path))
      .on('change', path => updateFileIndex(project.name, path))
      .on('add', path => addFileIndex(project.name, path))
  })
}
