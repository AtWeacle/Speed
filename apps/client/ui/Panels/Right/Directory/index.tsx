import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import useStore from '@weacle/speed-client/lib/useStore'
import axios from 'axios'

import type {
  DirectoryTree,
  FileSystemItem,
} from '@weacle/speed-lib/types'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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

  /* label {} */

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

  async function fetchDirectoryTree() {
    try {
      const response = await axios.get(`${SERVER_URL}/api/directory-tree`, {
        params: {
          path: projectDirectory,
          excludes: excludedFiles.join(',')
        }
      })
      setDirectoryTree(response.data)
    } catch (error) {
      console.error('Failed to fetch directory tree:', error)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      fetchDirectoryTree()
    }
  }

  function renderTree(item: FileSystemItem, depth = 0) {
    const isSelected = selectedItems.some(selectedItem => selectedItem.name === item.name && selectedItem.type === item.type)

    return (
      <TreeItem
        key={item.name}
        style={{ paddingLeft: `${depth * 20}px` }}
        isSelected={isSelected}
        onClick={() => addSelectedItem(item)}
      >
        {item.name} ({item.type})
        {item.children && item.children.map(child => renderTree(child, depth + 1))}
      </TreeItem>
    )
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
      <TreeContainer>
        {directoryTree && renderTree(directoryTree)}
      </TreeContainer>
      <ButtonContainer>
        <Button onClick={clearSelectedItems}>Deselect All</Button>
        <Button onClick={selectAllItems}>Select All</Button>
      </ButtonContainer>
    </Wrapper>
  )
}

export default Directory