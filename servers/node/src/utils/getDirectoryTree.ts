import fs from 'fs'
import path from 'path'

import type {
  FileSystemItem,
} from '@weacle/speed-lib/types'

export default function getDirectoryTree(
  rootPath: string,
  dirPath: string,
  paths: {
    filesToExclude: string
    filesToInclude: string
    pathsToExclude: string[]
  },
): FileSystemItem {
  const name = path.basename(dirPath)
  const stats = fs.statSync(dirPath)
  const defaultExcludes = ['node_modules', '.git', '.DS_Store', '.vscode', '.lock', 'pkg']
  const allExcludes = [...defaultExcludes, ...paths.filesToExclude.split(',')]
  const filesToInclude = paths.filesToInclude.split(',')

  if (!stats.isDirectory()) {
    return { name, type: 'file' }
  }

  const children: FileSystemItem[] = []
  const entries = fs.readdirSync(dirPath)

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry)

    const excludeThisPath = paths
      .pathsToExclude.filter(p => !!p)
      .some(excludePath => {
        return fullPath.startsWith(path.join(rootPath, excludePath))
      })

    if (excludeThisPath) {
      continue
    }

    if (allExcludes.some(exclude => {
      if (exclude.startsWith('*')) {
        return entry.endsWith(exclude.slice(1))
      }
      return entry === exclude
    })) {
      continue
    }

    const entryStats = fs.statSync(fullPath)

    if (entryStats.isFile() && !filesToInclude.some(include => {
      if (include.startsWith('*')) {
        return entry.endsWith(include.slice(1))
      }
      return entry.endsWith(include)
    })) {
      continue
    }

    const child = getDirectoryTree(rootPath, fullPath, paths)
    if (child.type === 'directory' && child.children.length === 0) {
      continue
    }

    children.push(child)
  }

  return {
    name,
    type: 'directory',
    children
  }
}