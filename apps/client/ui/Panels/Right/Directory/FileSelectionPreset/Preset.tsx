import React, { useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

import type { FileSelectionPreset } from '@weacle/speed-lib/types'
import Button from '@weacle/speed-client/ui/Button'
import { Input, InputWrapper } from '@weacle/speed-client/ui/Form'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const presetSchema = z.object({
  name: z.string().min(1).max(20),
  description: z.string().max(150).optional()
})

type Props = {
  preset: FileSelectionPreset
}

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

const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0 0 5px;
`

const Name = styled.div`
  font-size: .85rem;
  font-weight: 500;
`

const Description = styled.div`
  font-size: .8rem;
  font-weight: 500;
  color: var(--color-black-6);
`

const PresetActions = styled.div`
  display: flex;
  gap: 5px;
`

const PresetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  background-color: var(--color-black-1);
  padding: 5px 10px 5px 5px;
  border-radius: calc(var(--border-radius) * .8);
  min-height: 34px;

  span {
    font-size: .8rem;
  }
`

const PresetFiles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: .7rem;
  color: var(--color-gray-1);
  overflow-x: auto;
  max-height: 100px;
  width: 100%;
`

function Preset({ preset }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [name, setName] = useState(preset.name)
  const [description, setDescription] = useState(preset.description || '')
  const [isExpanded, setIsExpanded] = useState(false)

  const addSelectedItem = useProjectStore(state => state.addSelectedItem)
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

  function handleAdd() {
    preset.files.forEach(file => addSelectedItem(file))
  }

  function handleUse() {
    setSelectedItems(preset.files)
  }

  return (
    <PresetWrapper>
      <Head>
        <Name>{preset.name}</Name>
        {preset.description ?
          <Description aria-describedby={undefined}>{preset.description}</Description>
        : null}
      </Head>

      <PresetHeader onClick={() => setIsExpanded(!isExpanded)}>
        <Button
          title={isExpanded ? 'Collapse' : 'Expand'}
          appearance="text"
          style={{ padding: '2px', height: 'auto' }}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {isExpanded ?
          <PresetFiles>
            {preset.files.map(f => f.replace('root/', '')).map(file => (
              <div key={file}>{file}</div>
            ))}
          </PresetFiles>
        : <span>File list</span>}
      </PresetHeader>
      
      <PresetActions>
        <Button onClick={handleUse}>Use</Button>
        <Button onClick={handleAdd}>Add to selection</Button>

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

        <Button onClick={handleDelete} appearance="text" title="Delete">
          <Trash2 size={16} color="var(--color-black-6)" />
        </Button>
      </PresetActions>
    </PresetWrapper>
  )
}

export default Preset