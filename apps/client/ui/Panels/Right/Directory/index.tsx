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

import type {
  DirectoryTree,
  FileSystemItem,
} from '@weacle/speed-lib/types'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'
import useStore from '@weacle/speed-client/lib/useStore'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - var(--nav-height) - 60px);
  width: 100%;
  background-color: var(--color-black-2);
  border-radius: 0 0 calc(var(--border-radius) * 1.2) 0;
`

const DirectoryPath = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 5px;
  width: 100%;

  input {
    width: 100%;
    padding: 5px;
    border: none;
    background-color: var(--color-black-2);
    color: var(--color-black-8);
    border-radius: calc(var(--border-radius) * .5);
    border: 1px solid var(--color-black-4);
    transition: outline .2s, border-color .2s;
    outline: 1px solid transparent;
    font-size: .8rem;

    &:focus {
      outline-color: var(--color-deepblue);
      border-color: var(--color-deepblue);
    }

    &::placeholder {
      color: var(--color-black-6);
    }
  }
`

const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`

const TreeItem = styled.div<{ isSelected: boolean }>`
  cursor: pointer;
  padding: 5px;
  margin: 2px 0;
  background-color: ${props => props.isSelected ? 'var(--color-deepblue)' : 'transparent'};
  color: ${props => props.isSelected ? 'white' : 'inherit'};
  border-radius: calc(var(--border-radius) * .5);
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`

const Button = styled.button`
  padding: 5px 10px;
  background-color: var(--color-deepblue);
  color: white;
  border: none;
  border-radius: calc(var(--border-radius) * .5);
  cursor: pointer;
`
function Directory() {
  const setProjectDirectory = useStore(state => state.setProjectDirectory)
  const projectDirectory = useStore(state => state.projectDirectory)
  const directoryTree = useStore(state => state.directoryTree)
  const setDirectoryTree = useStore(state => state.setDirectoryTree)
  const excludedFiles = useStore(state => state.excludedFiles)
  const selectedItems = useStore(state => state.selectedItems)
  const addSelectedItem = useStore(state => state.addSelectedItem)
  const clearSelectedItems = useStore(state => state.clearSelectedItems)
  const selectAllItems = useStore(state => state.selectAllItems)

  const [treeData, setTreeData] = useState({})
  const [loading, setLoading] = useState(false)

  async function fetchDirectoryTree() {
    try {
      setLoading(true)
      const response = await axios.get(`${SERVER_URL}/api/directory-tree`, {
        params: {
          path: projectDirectory,
          excludes: excludedFiles.join(',')
        }
      })
      setDirectoryTree(response.data)
      setTreeData(convertToTreeData(response.data))
    } catch (error) {
      console.error('Failed to fetch directory tree:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      fetchDirectoryTree()
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

  return (
    <Wrapper>
      <DirectoryPath>
        <input
          className="Input"
          type="text"
          id="projectDirectory"
          placeholder="Enter project absolute path"
          defaultValue={projectDirectory}
          onChange={e => setProjectDirectory(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </DirectoryPath>

      <TreeContainer >
        {Object.keys(treeData).length > 0 && (
          <>{loading ?
            <div>Loading...</div>
          : <UncontrolledTreeEnvironment
            dataProvider={new StaticTreeDataProvider(treeData, (item, data) => ({ ...item, data }))}
            getItemTitle={item => item.data}
            viewState={{}}
          >
            <div className="rct-dark">
              <Tree treeId="tree-1" rootItem="root" treeLabel="Directory Tree" />
            </div>
          </UncontrolledTreeEnvironment>
        }</>)}
      </TreeContainer>
      <ButtonContainer>
        <Button onClick={clearSelectedItems}>Deselect All</Button>
        <Button onClick={selectAllItems}>Select All</Button>
      </ButtonContainer>
    </Wrapper>
  )
}

export default Directory