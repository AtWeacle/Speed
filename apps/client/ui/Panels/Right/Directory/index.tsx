import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  type TreeItem,
  type TreeItemIndex,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
} from 'lucide-react'

import type {
  DirectoryTree,
  FileSystemItem,
} from '@weacle/speed-lib/types'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import FileSearch from '@weacle/speed-client/ui/Panels/Right/Directory/FileSearch'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
  max-height: calc(100vh - var(--nav-height) - 66px);
  width: 100%;
  background-color: var(--color-black-2);
  border-radius: 0 0 calc(var(--border-radius) * 1.2) 0;
`
const Title = styled.h6`
  margin: 0;
  padding: 5px 10px;
  font-size: .8rem;
  color: var(--color-black-8);
`
const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border-radius: calc(var(--border-radius) * .8) calc(var(--border-radius) * .8) 0 0;
  margin: 0 5px;
  background-color: var(--color-black-1);

  --rct-bar-color: var(--color-deepblue);
  --rct-bar-width: 4px;
  --rct-arrow-container-size: 24px;
  --rct-color-focustree-item-selected-bg: oklch(from var(--color-deepblue) l c h / 0.15);

  .rct-tree-item-arrow {
    svg {
      width: 20px;
      stroke: var(--color-black-8);
    }
  }

  .rct-tree-item-li {
    width: calc(100% - 5px);
  }
`
const ItemArrow = styled.span`
  display: flex;
  align-items: center;
`
const SelectedItems = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0 5px 5px;
  background-color: var(--color-black-3);
  border-radius: 0 0 calc(var(--border-radius) * .8) calc(var(--border-radius) * .8);
`
const SelectedItemsList = styled.ul`
  list-style-type: none;
  padding: 0 5px;
  margin: 0 5px 5px;
  max-height: 150px;
  overflow-y: auto;
`
const SelectedItem = styled.li`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-black-8);
  margin-bottom: 5px;
  gap: 5px;
`
// const ButtonContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 10px;
// `
// const Button = styled.button`
//   padding: 5px 10px;
//   background-color: var(--color-black-4);
//   color: var(--color-black-8);
//   font-size: .8rem;
//   border: none;
//   border-radius: calc(var(--border-radius) * .5);
//   cursor: pointer;
// `
function Directory() {
  const directoryTreeConverted = useProjectStore(state => state.directoryTreeConverted)
  const setDirectoryTreeConverted = useProjectStore(state => state.setDirectoryTreeConverted)
  const setDirectoryTree = useProjectStore(state => state.setDirectoryTree)
  const selectedItems = useProjectStore(state => state.selectedItems)
  const setSelectedItems = useProjectStore(state => state.setSelectedItems)

  const [loading, setLoading] = useState(false)
  const [showTree, setShowTree] = useState(true)
  console.log('directoryTreeConverted', directoryTreeConverted)
  console.log('showTree', showTree)

  useEffect(() => {
    function handleRefetchEvent() {
      fetchDirectoryTree()
    }

    document.addEventListener('we.directoryTree.refetch', handleRefetchEvent)

    return () => {
      document.removeEventListener('we.directoryTree.refetch', handleRefetchEvent)
    }
  }, [])

  useEffect(() => {
    setShowTree(false)

    setTimeout(() => {
      setShowTree(true)
    }, 200)
  }, [directoryTreeConverted])

  async function fetchDirectoryTree() {
    const {
      path,
      filesToInclude,
      filesToExclude,
      pathsToExclude,
    } = useProjectStore.getState()

    try {
      setLoading(true)

      const response = await axios.get(`${SERVER_URL}/api/directory-tree`, {
        params: {
          directory: path,
          filesToExclude,
          filesToInclude,
          pathsToExclude,
        }
      })

      setDirectoryTree(response.data)
      setDirectoryTreeConverted(convertToTreeData(response.data))

    } catch (error) {
      console.error('Failed to fetch directory tree:', error)
    } finally {
      setLoading(false)
    }
  }

  function convertToTreeData(tree: DirectoryTree): Record<TreeItemIndex, TreeItem<string>> {
    const items: Record<TreeItemIndex, TreeItem<string>> = {}

    function traverse(item: FileSystemItem, parentIndex: TreeItemIndex | null = null) {
      const index = parentIndex === null ? 'root' : `${parentIndex}/${item.name}`
      items[index] = {
        index,
        isFolder: item.type === 'directory',
        data: item.name,
        children: item.children?.map(child => `${index}/${child.name}`)
      }
      item.children?.forEach(child => traverse(child, index))
    }

    traverse(tree)
    return items
  }

  function onSelectItems(items: TreeItemIndex[]) {
    setSelectedItems(items as string[])
  }

  function isDirectory(item: string): boolean {
    return directoryTreeConverted?.[item]?.isFolder || false
  }

  return (
    <Wrapper>
      <FileSearch />

      <TreeContainer className="rct-dark">
        {showTree && directoryTreeConverted && Object.keys(directoryTreeConverted).length > 0 && (
          <>{loading ?
            <div>Loading...</div>
          : <UncontrolledTreeEnvironment
            dataProvider={new StaticTreeDataProvider(directoryTreeConverted, (item, data) => ({ ...item, data }))}
            getItemTitle={item => item.data}
            onSelectItems={onSelectItems}
            renderItemArrow={({ item, context }) => item.isFolder
              ? <ItemArrow
                {...context.arrowProps}
                className='rct-tree-item-arrow'
                onClick={() => context.toggleExpandedState()}
              >
                {context.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </ItemArrow> : <div className="rct-tree-item-arrow" aria-hidden="true" tabIndex={-1}></div>}
            viewState={{
              'tree-1': {
                selectedItems,
              },
            }}
          >
            <Tree treeId="tree-1" rootItem="root" treeLabel="Directory Tree" />
          </UncontrolledTreeEnvironment>
        }</>)}
      </TreeContainer>

      <SelectedItems>
        <Title>Selection</Title>

        {selectedItems.length > 0 ? (
          <SelectedItemsList>
            {selectedItems.map((item, index) => (
              <SelectedItem key={index}>
                {isDirectory(item)
                  ? <Folder color="var(--color-black-8)" size={12} />
                  : <FileText color="var(--color-black-8)"  size={12} />
                }
                {item.replace('root/', '')}
              </SelectedItem>
            ))}
          </SelectedItemsList>
        ) : null}
      </SelectedItems>
      

      {/* <ButtonContainer>
        <Button onClick={clearSelectedItems}>Deselect All</Button>
        <Button onClick={selectAllItems}>Select All</Button>
      </ButtonContainer> */}
    </Wrapper>
  )
}

export default Directory