import fs from 'fs'
import path from 'path'

import type {
  FileSystemItem,
} from '@weacle/speed-lib/types'


export default function getDirectoryTree(dirPath: string, excludes: string[]): FileSystemItem {
  const name = path.basename(dirPath)
  const stats = fs.statSync(dirPath)

  if (!stats.isDirectory()) {
    return { name, type: 'file' }
  }

  const children: FileSystemItem[] = []
  const entries = fs.readdirSync(dirPath)

  for (const entry of entries) {
    if (excludes.some(exclude => {
      if (exclude.startsWith('*')) {
        return entry.endsWith(exclude.slice(1))
      }
      return entry === exclude
    })) {
      continue
    }

    const fullPath = path.join(dirPath, entry)
    children.push(getDirectoryTree(fullPath, excludes))
  }

  return {
    name,
    type: 'directory',
    children
  }
}
