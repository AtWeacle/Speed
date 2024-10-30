import React from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { List, ListPlus } from 'lucide-react'
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
  name: z.string().min(1).max(20),
  description: z.string().max(150).optional(),
  id: z.string(),
  files: z.array(z.string())
})

function FileSelectionPreset() {
  const selectedItems = useProjectStore(state => state.selectedItems)
  const addFileSelectionPreset = useProjectStore(state => state.addFileSelectionPreset)

  function handleCreatePreset(name: string, description?: string) {
    const preset = {
      name,
      description,
      id: nanoid(),
      files: selectedItems
    }

    const result = presetSchema.safeParse(preset)
    if (!result.success) return

    addFileSelectionPreset(preset)
  }

  return (
    <Wrapper>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button title="Create Preset" appearance="text">
            <ListPlus size={16} />
          </Button>
        </Dialog.Trigger>

        <CreatePreset onCreatePreset={handleCreatePreset} />
      </Dialog.Root>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button title="See Presets" appearance="text">
            <List size={16} />
          </Button>
        </Dialog.Trigger>

        <SeePresets />
      </Dialog.Root>
    </Wrapper>
  )
}

export default FileSelectionPreset