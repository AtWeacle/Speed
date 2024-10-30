import React, { useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import type { FileSelectionPreset } from '@weacle/speed-lib/types'
import Button from '@weacle/speed-client/ui/Button'
import { Input, InputWrapper } from '@weacle/speed-client/ui/Form'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const presetSchema = z.object({
  name: z.string().min(1).max(20),
  description: z.string().max(150).optional()
})

const PresetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background-color: var(--color-black-2);
  border-radius: var(--border-radius);

  button {
    font-size: .8rem;
    color: var(--color-black-8);
    padding: 4px 8px;
  }
`

function UpdatePreset({ preset }: { preset: FileSelectionPreset }) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [name, setName] = useState(preset.name)
  const [description, setDescription] = useState(preset.description || '')

  const updateFileSelectionPreset = useProjectStore(state => state.updateFileSelectionPreset)

  function handleUpdate() {
    const result = presetSchema.safeParse({ name, description })
    if (!result.success) return

    updateFileSelectionPreset(preset.id, { name, description })
    setIsUpdateOpen(false)
  }
  return (
    <>
      <Dialog.Root open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <Dialog.Trigger asChild>
          <Button>Update</Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay
            className="DialogOverlay"
            style={{
              zIndex: 'calc(var(--z-index-dialog) + 1)',
            }}
          />
          <Dialog.Content
            className="DialogContent"
            aria-describedby={undefined}
            style={{
              maxWidth: '400px',
              gap: '15px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 'calc(var(--z-index-dialog) + 2)',
            }}
          >
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

export default UpdatePreset