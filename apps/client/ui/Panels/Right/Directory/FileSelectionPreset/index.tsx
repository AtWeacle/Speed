import React, { useState } from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { List, Plus, X } from 'lucide-react'
import { nanoid } from '@weacle/speed-lib/utils/nanoid'
import { z } from 'zod'

import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import Button from '@weacle/speed-client/ui/Button'
import CreatePreset from '@weacle/speed-client/ui/Panels/Right/Directory/FileSelectionPreset/CreatePreset'
import SeePresets from '@weacle/speed-client/ui/Panels/Right/Directory/FileSelectionPreset/SeePresets'

const Wrapper = styled.div`
  display: flex;
  margin: 0 0 0 auto;
  gap: 4px;

  button {
    color: var(--color-black-8);
    padding: 2px 2px;
  }
`

const presetSchema = z.object({
  name: z.string().min(1, 'Name must have at least 1 character').max(20, 'Name must have at most 20 characters'),
  description: z.string().max(150, 'Description must have at most 150 characters').optional(),
  id: z.string(),
  files: z.array(z.string())
})

function FileSelectionPreset() {
  const selectedItems = useProjectStore(state => state.selectedItems)
  const clearSelectedItems = useProjectStore(state => state.clearSelectedItems)
  const addFileSelectionPreset = useProjectStore(state => state.addFileSelectionPreset)

  const [open, setOpen] = useState(false)

  function handleRemoveSelectedItems() {
    clearSelectedItems()
  }

  function handleCreatePreset(name: string, description?: string) {
    const preset = {
      name,
      description,
      id: nanoid(),
      files: selectedItems
    }

    const result = presetSchema.safeParse(preset)
    if (!result.success) {
      return { 
        success: false, 
        error: result.error.issues[0].message 
      }
    }

    addFileSelectionPreset(preset)
    return { success: true }
  }

  return (
    <Wrapper>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button title="Create Preset" appearance="text">
            <Plus size={16} />
          </Button>
        </Dialog.Trigger>

        <CreatePreset onCreatePreset={handleCreatePreset} onClose={() => setOpen(false)} />
      </Dialog.Root>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button title="See Presets" appearance="text">
            <List size={16} />
          </Button>
        </Dialog.Trigger>

        <SeePresets />
      </Dialog.Root>

      <Button title="Clear Selection" appearance="text"  onClick={handleRemoveSelectedItems}>
        <X size={14} />
      </Button>
    </Wrapper>
  )
}

export default FileSelectionPreset