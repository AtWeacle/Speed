import React, { useState } from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { z } from 'zod'

import type { FileSelectionPreset } from '@weacle/speed-lib/types'
import Button from '@weacle/speed-client/ui/Button'
import { Input, InputWrapper } from '@weacle/speed-client/ui/Form'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const PresetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background-color: var(--color-black-2);
  border-radius: var(--border-radius);
`

const PresetActions = styled.div`
  display: flex;
  gap: 5px;
`

const StyledContent = styled(Dialog.Content)`
  max-width: 400px;
  gap: 15px;
  display: flex;
  flex-direction: column;
`

const presetSchema = z.object({
  name: z.string().min(1).max(20),
  description: z.string().max(150).optional()
})

type Props = {
  preset: FileSelectionPreset
}

function Preset({ preset }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [name, setName] = useState(preset.name)
  const [description, setDescription] = useState(preset.description || '')

  const removeFileSelectionPreset = useProjectStore(state => state.removeFileSelectionPreset)
  const updateFileSelectionPreset = useProjectStore(state => state.updateFileSelectionPreset)
  const setSelectedItems = useProjectStore(state => state.setSelectedItems)

  function handleDelete() {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      removeFileSelectionPreset(preset.id)
    }
  }

  function handleUpdate() {
    const result = presetSchema.safeParse({ name, description })
    if (!result.success) return

    updateFileSelectionPreset(preset.id, { name, description })
    setIsUpdateOpen(false)
  }

  function handleLoad() {
    setSelectedItems(preset.files)
  }

  return (
    <PresetWrapper>
      <div>{preset.name}</div>
      {preset.description && <div>{preset.description}</div>}
      
      <PresetActions>
        <Button onClick={handleLoad}>Load</Button>
        <Button onClick={handleDelete}>Delete</Button>
        <Dialog.Root open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
          <Dialog.Trigger asChild>
            <Button>Update</Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <StyledContent className="DialogContent">
              <Dialog.Title className="DialogTitle">Update Preset</Dialog.Title>

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

              <Button onClick={handleUpdate}>Update Preset</Button>

              <Dialog.Close asChild>
                <Button className="IconButton" aria-label="Close">
                  <X size={24} />
                </Button>
              </Dialog.Close>
            </StyledContent>
          </Dialog.Portal>
        </Dialog.Root>
      </PresetActions>
    </PresetWrapper>
  )
}

export default Preset