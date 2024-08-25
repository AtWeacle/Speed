import React from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Settings as SettingsIcon,
  X,
} from 'lucide-react'

import SystemPrompt from '@weacle/speed-client/ui/Chat/SystemPrompt'
import SelectModel from '@weacle/speed-client/ui/Panels/Right/Settings/SelectModel'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 60px;
  width: calc(100% - 20px);
  background-color: var(--color-black-2);
  border-radius: 0 calc(var(--border-radius) * 1.2) 0 0;
`

function Settings() {
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
            <SettingsIcon size={20} strokeWidth={2} />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content
            className="DialogContent DialogSettings"
            style={{ maxWidth: '400px' }}
            aria-describedby={undefined}
          >
            <Dialog.Title
              className="DialogTitle"
              style={{ marginBottom: '20px' }}
            >
              Settings
            </Dialog.Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label>Model</label>
              <SelectModel />
            </div>            
            
            <Dialog.Close asChild>
              <button className="IconButton" aria-label="Close">
                <X size={24} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Wrapper>
  )
}

export default Settings
