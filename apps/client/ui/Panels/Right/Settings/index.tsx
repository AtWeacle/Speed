import React, { useCallback, useRef } from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Settings as SettingsIcon,
  X,
} from 'lucide-react'

import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import SystemPrompt from '@weacle/speed-client/ui/Chat/SystemPrompt'
import SelectModel from '@weacle/speed-client/ui/Panels/Right/Settings/SelectModel'
import {
  InputWrapper,
  Input,
} from '@weacle/speed-client/ui/Form'
import Button from '@weacle/speed-client/ui/Button'

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
function Settings() {
  const filesToInclude = useProjectStore(state => state.filesToInclude)
  const setFilesToInclude = useProjectStore(state => state.setFilesToInclude)
  const filesToExclude = useProjectStore(state => state.filesToExclude)
  const setFilesToExclude = useProjectStore(state => state.setFilesToExclude)
  const pathsToExclude = useProjectStore(state => state.pathsToExclude)
  const setPathsToExclude = useProjectStore(state => state.setPathsToExclude)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const dispatchRefetchEvent = useCallback(() => {
    const event = new CustomEvent('we.directoryTree.refetch')
    document.dispatchEvent(event)
  }, [])

  const handleChange = useCallback((setter: (value: string) => void, value: string) => {
    setter(value)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(dispatchRefetchEvent, 2000)
  }, [dispatchRefetchEvent])

  const handlePathsChange = useCallback((setter: (value: string[]) => void, value: string[]) => {
    setter(value)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(dispatchRefetchEvent, 2000)
  }, [dispatchRefetchEvent])

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
            style={{ maxWidth: '400px', gap: '15px', display: 'flex', flexDirection: 'column' }}
            aria-describedby={undefined}
          >
            <Dialog.Title className="DialogTitle">
              Settings
            </Dialog.Title>

            <InputWrapper>
              <label>Model</label>
              <SelectModel />
            </InputWrapper>

            <InputWrapper>
              <label>Files to include</label>
              <Input
                type="text"
                value={filesToInclude}
                onChange={(e) => handleChange(setFilesToInclude, e.target.value)}
                placeholder=".rs,.js,.ts,.tsx"
              />
            </InputWrapper>

            <InputWrapper>
              <label>Files to exclude</label>
              <Input
                type="text"
                value={filesToExclude}
                onChange={(e) => handleChange(setFilesToExclude, e.target.value)}
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
