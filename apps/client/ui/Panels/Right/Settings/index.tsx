import React, { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { debounce } from 'lodash'
import {
  Settings as SettingsIcon,
  X,
} from 'lucide-react'

import useStore from '@weacle/speed-client/lib/useStore'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import {
  slugify,
} from '@weacle/speed-lib/utils/helpers'
import SystemPrompt from '@weacle/speed-client/ui/Chat/SystemPrompt'
import SelectModel from '@weacle/speed-client/ui/Panels/Right/Settings/SelectModel'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'
import {
  InputWrapper,
  Input,
} from '@weacle/speed-client/ui/Form'
import Button from '@weacle/speed-client/ui/Button'


const debounceEvent = debounce(() => {
  document.dispatchEvent(new CustomEvent('we.directoryTree.refetch'))
}, 1000)

const debounceSave = debounce(async () => {
  const { getActiveProject } = useStore.getState()
  const project = getActiveProject()
  console.log('project', project)
  if (!project) return

  const { name, path, filesToExclude, filesToInclude, pathsToExclude } = project

  const params = new URLSearchParams({ slug: slugify(name) })
  
  try {
    const response = await fetch(`${SERVER_URL}/api/project?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        path,
        settings: {
          filesToExclude: filesToExclude.split(','),
          filesToInclude: filesToInclude.split(','),
          pathsToExclude: pathsToExclude.filter(path => path.length > 0),
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update project')
    }
  } catch (error) {
    console.error('Error updating project:', error)
  }
}, 2000)

const Wrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0 10px;
  height: 60px;
  width: calc(100% - 20px);
  background-color: var(--color-black-2);
  border-radius: 0 calc(var(--border-radius) * 1.2) 0 0;
`
const StyledTextarea = styled.textarea`
  background-color: var(--color-black-2);
  resize: vertical;
  min-height: 100px;
`
const Separator = styled.hr`
  width: 100%;
  margin: 10px 0;
  border: none;
  border-top: 1px solid var(--color-black-2);
`
function Settings() {
  const filesToInclude = useProjectStore(state => state.filesToInclude)
  const setFilesToInclude = useProjectStore(state => state.setFilesToInclude)
  const filesToExclude = useProjectStore(state => state.filesToExclude)
  const setFilesToExclude = useProjectStore(state => state.setFilesToExclude)
  const pathsToExclude = useProjectStore(state => state.pathsToExclude)
  const setPathsToExclude = useProjectStore(state => state.setPathsToExclude)
  const name = useProjectStore(state => state.name)
  const setName = useProjectStore(state => state.setName)
  const path = useProjectStore(state => state.path)
  const setPath = useProjectStore(state => state.setPath)
  const removeProject = useStore(state => state.removeProject)

  const handleDirChange = useCallback((setter: (value: string) => void, value: string) => {
    setter(value)
    debounceEvent()
    debounceSave()
  }, [])

  const handlePathsChange = useCallback((setter: (value: string[]) => void, value: string[]) => {
    setter(value)
    debounceEvent()
    debounceSave()
  }, [])

  const handleRemoveProject = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const { activeProjectId } = useStore.getState()
      if (activeProjectId) removeProject(activeProjectId)
    }
  }, [removeProject])

  function handleStartFileIndex() {
    const params = new URLSearchParams({
      directory: path,
      project: name,
      filesToExclude,
      filesToInclude,
      pathsToExclude: pathsToExclude.join(',')
    })

    fetch(`${SERVER_URL}/api/file-index/start?${params.toString()}`, {
      method: 'POST'
    })
  }

  return (
    <Wrapper>
      <SystemPrompt />

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            className="Button"
            style={{
              backgroundColor: 'transparent',
              padding: '5px',
            }}
          >
            <SettingsIcon size={20} strokeWidth={2} color="var(--color-black-7)" />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content
            className="DialogContent DialogSettings"
            style={{
              maxWidth: '400px',
              gap: '15px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
            aria-describedby={undefined}
          >
            <Dialog.Title className="DialogTitle">
              Settings
            </Dialog.Title>

            <InputWrapper>
              <label>Model</label>
              <SelectModel />
            </InputWrapper>

            <Separator />

            <InputWrapper>
              <label>Project name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputWrapper>

            <InputWrapper>
              <label>Project path</label>
              <Input
                type="text"
                value={path}
                onChange={(e) => handleDirChange(setPath, e.target.value)}
                placeholder="Absolute path to the project"
              />
            </InputWrapper>

            <InputWrapper>
              <label>Files to include</label>
              <Input
                type="text"
                value={filesToInclude}
                onChange={(e) => handleDirChange(setFilesToInclude, e.target.value)}
                placeholder=".rs,.js,.ts,.tsx"
              />
            </InputWrapper>

            <InputWrapper>
              <label>Files to exclude</label>
              <Input
                type="text"
                value={filesToExclude}
                onChange={(e) => handleDirChange(setFilesToExclude, e.target.value)}
                placeholder="package.json,*.d.ts"
              />
            </InputWrapper>

            <InputWrapper>
              <label>Relative paths to exclude</label>
              <StyledTextarea
                value={pathsToExclude.join('\n')}
                onChange={(e) => handlePathsChange(setPathsToExclude, e.target.value.split('\n'))}
                placeholder="/apps/client/public&#10;/apps/server/api"
              />
            </InputWrapper>

            <Separator />

            <InputWrapper>
              <Button
                className="Button"
                style={{
                  backgroundColor: 'var(--color-black-3)',
                  color: 'var(--color-black-8)',
                  padding: '7px 10px',
                  height: 'auto',
                }}
                onClick={handleStartFileIndex}
              >
                Start file indexing
              </Button>
            </InputWrapper>

            <Separator />

            <InputWrapper>
              <Button
                className="Button"
                style={{
                  backgroundColor: 'var(--color-red)',
                  color: 'var(--color-black)',
                  padding: '7px 10px',
                  height: 'auto',
                }}
                onClick={handleRemoveProject}
              >
                Delete project
              </Button>
            </InputWrapper>
            
            <Dialog.Close asChild>
              <Button className="IconButton" aria-label="Close">
                <X size={24} />
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Wrapper>
  )
}

export default Settings
