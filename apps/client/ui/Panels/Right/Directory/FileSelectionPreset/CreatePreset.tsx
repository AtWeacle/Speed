import React, { useState } from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import Button from '@weacle/speed-client/ui/Button'
import { Input, InputWrapper } from '@weacle/speed-client/ui/Form'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const StyledContent = styled(Dialog.Content)`
  max-width: 400px;
  gap: 15px;
  display: flex;
  flex-direction: column;
`

const SelectedItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow: auto;
  font-size: .8rem;
`

type Props = {
  onCreatePreset: (name: string, description?: string) => void
}

function CreatePreset({ onCreatePreset }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const selectedItems = useProjectStore(state => state.selectedItems)

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="DialogOverlay" />
      <StyledContent className="DialogContent">
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

        <Button onClick={() => onCreatePreset(name, description)}>
          Create Preset
        </Button>

        <Dialog.Close asChild>
          <Button className="IconButton" aria-label="Close">
            <X size={24} />
          </Button>
        </Dialog.Close>
      </StyledContent>
    </Dialog.Portal>
  )
}

export default CreatePreset