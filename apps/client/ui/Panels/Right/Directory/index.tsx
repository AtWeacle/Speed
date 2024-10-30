import React, { useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import {
  ControlledTreeEnvironment,
  Tree,
  type TreeItem,
  type TreeItemIndex,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  SquareArrowOutUpRight,
  X,
} from 'lucide-react'
import useWebSocket from 'react-use-websocket'

import type {
  DirectoryTree,
  FileSystemItem,
} from '@weacle/speed-lib/types'
import { SERVER_URL, WS_URL } from '@weacle/speed-client/lib/constants'
import { REFRESH_DIRECTORY_TREE } from '@weacle/speed-lib/constants'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import FileSearch from '@weacle/speed-client/ui/Panels/Right/Directory/FileSearch'
import FileSelectionPreset from '@weacle/speed-client/ui/Panels/Right/Directory/FileSelectionPreset'

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

  [role="tree"] {
    margin-right: 4px;
  }

  .rct-tree-items-container {
    li {
      margin: 0 0 0 4px;

      ul {
        li {
          margin: 0 0 0 10px;
        }
      }
    }

    .rct-tree-item-li {
      width: calc(100% - 5px);
    }

    .rct-tree-item-arrow {
      margin-right: 0px;

      svg {
        width: 20px;
        stroke: var(--color-black-8);
      }
    }

    [role="treeitem"] {
      display: flex;
      flex-direction: column;

      [data-rct-item-container="true"] {
        display: flex;
        background-color: transparent;
        align-items: center;
        border-radius: calc(var(--border-radius) * .4);
        cursor: pointer;
        transition: background-color .2s ease-in-out, color .2s ease-in-out;
        padding: 0px 10px 0 0;
        font-size: .85rem;
        color: var(--color-black-7);

        &:hover {
          background-color: var(--color-black-2);
          color: var(--color-black-9);
        }
      }
    }
  }
`
const ItemArrow = styled.span`
  display: flex;
  align-items: center;
  color: var(--color-black-4);

  svg path {
    stroke: var(--color-black-5);
  }
`
const SelectedItems = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0 5px 5px;
  background-color: var(--color-black-3);
  border-radius: 0 0 calc(var(--border-radius) * .8) calc(var(--border-radius) * .8);
`
const SelectedItemsHead = styled.div`
  display: flex;
  gap: 2px;
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
  gap: 2px;
  justify-content: space-between;
  max-width: calc(100% - 10px);
  transition: background-color .2s ease-in-out, color .2s ease-in-out;

  &:hover {
    background-color: var(--color-black-2);
  }
`
const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  span {
    display: block;
    width: 290px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
  }
`
const ItemActions = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
`
const ItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0px 0px;
  height: 22px;
  cursor: pointer;
  color: var(--color-black-7);
  border-radius: calc(var(--border-radius) * .6);
  transition: background-color .2s, color .2s;
  font-size: .75rem;

  &:hover {
    color: var(--color-black-9);
  }
`
function Directory() {
  const directoryTreeConverted = useProjectStore(state => state.directoryTreeConverted)
  const expandedItems = useProjectStore(state => state.expandedItems)
  const addExpandedItems = useProjectStore(state => state.addExpandedItems)
  const removeExpandedItems = useProjectStore(state => state.removeExpandedItems)
  const selectedItems = useProjectStore(state => state.selectedItems)
  const setSelectedItems = useProjectStore(state => state.setSelectedItems)

  useWebSocket(WS_URL, {
    share: true,
    shouldReconnect: () => true,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === REFRESH_DIRECTORY_TREE) {
          document.dispatchEvent(new Event('we.directoryTree.refetch'))
        }

      } catch (error) {
        console.error('Error parsing event data:', error)
      }
    },
  })

  useEffect(() => {
    async function fetchDirectoryTree() {
      const {
        path,
        filesToInclude,
        filesToExclude,
        pathsToExclude,
        setDirectoryTree,
        setDirectoryTreeConverted,
      } = useProjectStore.getState()

      try {
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
      }
    }

    document.addEventListener('we.directoryTree.refetch', fetchDirectoryTree)

    return () => {
      document.removeEventListener('we.directoryTree.refetch', fetchDirectoryTree)
    }
  }, [])

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

  function onExpandItem(item: TreeItem<any>) {
    addExpandedItems(item.index as string)
  }

  function onCollapseItem(item: TreeItem<any>) {
    removeExpandedItems(item.index as string)
  }

  function isDirectory(item: string): boolean {
    return directoryTreeConverted?.[item]?.isFolder || false
  }

  return (
    <Wrapper>
      <FileSearch />

      <TreeContainer className="rct-dark">
        {directoryTreeConverted && Object.keys(directoryTreeConverted).length > 0 ?
          <ControlledTreeEnvironment
            getItemTitle={item => item.data}
            items={directoryTreeConverted}
            // onSelectItems={onSelectItems}
            onExpandItem={onExpandItem}
            onCollapseItem={onCollapseItem}
            renderItemArrow={({ item, context }) => item.isFolder
              ? <ItemArrow
                  {...context.arrowProps}
                  className='rct-tree-item-arrow'
                  onClick={() => context.toggleExpandedState()}
                >
                  {context.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </ItemArrow>
              : <div className="rct-tree-item-arrow" aria-hidden="true" tabIndex={-1}></div>
            }

            renderItem={({ title, arrow, depth, context, children }) => {
              const InteractiveComponent = context.isRenaming ? 'div' : 'span';
              return (
                <li {...context.itemContainerWithChildrenProps}>
                  <InteractiveComponent {...context.itemContainerWithoutChildrenProps} {...context.interactiveElementProps}>
                    {arrow}
                    {title}
                  </InteractiveComponent>
                  {children}
                </li>
              )
            }}

            viewState={{
              'tree-1': {
                expandedItems,
                selectedItems,
              },
            }}
          >
            <Tree treeId="tree-1" rootItem="root" treeLabel="Directory Tree" />
          </ControlledTreeEnvironment>
        : null}
      </TreeContainer>

      <SelectedItems>
        <SelectedItemsHead>
          <Title>Selection</Title>
          <FileSelectionPreset />
        </SelectedItemsHead>

        {selectedItems.length > 0 ? (
          <SelectedItemsList>
            {selectedItems.map((item, index) => {
              const itemPath = item.replace('root/', '')
              return (
                <SelectedItem key={index}>
                  <ItemContent title={itemPath}>
                    {isDirectory(item)
                      ? <Folder color="var(--color-black-8)" size={12} />
                      : <FileText color="var(--color-black-8)"  size={12} />
                    }
                    <span>{itemPath}</span>
                  </ItemContent>
                  <ItemActions>
                    {!isDirectory(item) ? <ItemButton onClick={() => {
                      axios.post(`${SERVER_URL}/api/file/open`, null, {
                        params: { path: `${useProjectStore.getState().path}/${itemPath}` }
                      })
                    }}>
                      <SquareArrowOutUpRight color="var(--color-black-8)" size={11} strokeWidth={2.5} />
                    </ItemButton> : null}
                    <ItemButton onClick={() => {
                      const newSelectedItems = selectedItems.filter(i => i !== item)
                      setSelectedItems(newSelectedItems)
                    }}>
                      <X color="var(--color-black-8)" size={11} strokeWidth={2.5} />
                    </ItemButton>
                  </ItemActions>
                </SelectedItem>
              )
            })}
          </SelectedItemsList>
        ) : null}
      </SelectedItems>
    </Wrapper>
  )
}

export default Directory