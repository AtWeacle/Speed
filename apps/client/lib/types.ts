import {
  type TreeItem,
  type TreeItemIndex,
} from 'react-complex-tree'

export type DirectoryTreeConverted = Record<TreeItemIndex, TreeItem<string>>
