import fs from 'fs'
import path from 'path'

import type {
  FileSystemItem,
  PathSettings,
} from '@weacle/speed-lib/types'
import {
  DEFAULT_FILES_TO_EXCLUDE,
  DEFAULT_PATHS_TO_EXCLUDE,
} from '@weacle/speed-lib/constants'

export default function getDirectoryTree(
  rootPath: string,
  dirPath: string,
  settings: PathSettings,
): FileSystemItem {
  const name = path.basename(dirPath)
  const stats = fs.statSync(dirPath)
  const allExcludes = [...DEFAULT_FILES_TO_EXCLUDE, ...settings.filesToExclude.split(',')]
  const allPathExcludes = [...DEFAULT_PATHS_TO_EXCLUDE, ...settings.pathsToExclude]
  const filesToInclude = settings.filesToInclude.split(',')

  if (!stats.isDirectory()) {
    return { name, type: 'file' }
  }

  const children: FileSystemItem[] = []
  const entries = fs.readdirSync(dirPath)

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry)

    const excludeThisPath = allPathExcludes
      .filter(p => !!p)
      .some(excludePath => {
        if (excludePath.startsWith('*')) {
          const pathToCheck = excludePath.slice(1)
          return fullPath.includes(pathToCheck)
        }
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

    const child = getDirectoryTree(rootPath, fullPath, settings)
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