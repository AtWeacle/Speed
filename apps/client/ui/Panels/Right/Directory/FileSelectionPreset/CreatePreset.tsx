import React, { useState } from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import Button from '@weacle/speed-client/ui/Button'
import { Input, InputWrapper } from '@weacle/speed-client/ui/Form'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const SelectedItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow: auto;
  font-size: .8rem;
`
const Error = styled.span`
  color: var(--color-red);
  font-size: 0.8rem;
  margin-top: 4px;
`

function CreatePreset({
  onCreatePreset,
  onClose,
}: {
  onCreatePreset: (name: string, description?: string) => { success: boolean, error?: string }
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const selectedItems = useProjectStore(state => state.selectedItems)

  function handleCreatePreset() {
    const result = onCreatePreset(name, description)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'An error occurred')
    }
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="DialogOverlay" />
      <Dialog.Content
        className="DialogContent"
        aria-describedby={undefined}
        style={{
          maxWidth: '400px',
          gap: '15px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Dialog.Title className="DialogTitle">Create Preset</Dialog.Title>

        <InputWrapper>
          <label>Name</label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            required
          />
          {error ? <Error>{error}</Error> : null}
        </InputWrapper>

        <InputWrapper>
          <label>Description</label>
          <Input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={150}
          />
        </InputWrapper>

        <InputWrapper>
          <label>Selected Items</label>
          <SelectedItems>
            {selectedItems.map(item => (
              <li key={item}>{item.replace('root/', '')}</li>
            ))}
          </SelectedItems>
        </InputWrapper>

        <Button onClick={handleCreatePreset}>
          Create Preset
        </Button>

        <Dialog.Close asChild>
          <Button className="IconButton" aria-label="Close">
            <X size={24} />
          </Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export default CreatePreset