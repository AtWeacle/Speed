import React, { useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus } from 'lucide-react'

import type { FileSelectionPreset } from '@weacle/speed-lib/types'
import Button from '@weacle/speed-client/ui/Button'
import { Input, InputWrapper } from '@weacle/speed-client/ui/Form'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'

const presetSchema = z.object({
  name: z.string().min(1).max(20),
  description: z.string().max(150).optional()
})

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
`

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .8rem;
  color: var(--color-black-8);
  padding: 4px 8px;
  background-color: var(--color-black-2);
  border-radius: calc(var(--border-radius) * .4);

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
  }

  button {
    padding: 2px;
    margin-left: auto;
  }
`

const AddFile = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 5px;

  input {
    flex: 1;
  }
`

function UpdatePreset({ preset }: { preset: FileSelectionPreset }) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [name, setName] = useState(preset.name)
  const [description, setDescription] = useState(preset.description || '')
  const [files, setFiles] = useState(preset.files)
  const [newFile, setNewFile] = useState('')

  const updateFileSelectionPreset = useProjectStore(state => state.updateFileSelectionPreset)
  const project = useProjectStore(state => state)

  function handleUpdate() {
    const result = presetSchema.safeParse({ name, description })
    if (!result.success) return

    updateFileSelectionPreset(preset.id, { name, description, files })
    setIsUpdateOpen(false)
  }

  function handleRemoveFile(file: string) {
    setFiles(files.filter(f => f !== file))
  }

  function handleAddFile() {
    if (!newFile || !project) return

    let filePath = newFile
    if (filePath.startsWith(project.path)) {
      filePath = filePath.replace(project.path, 'root')
    } else {
      filePath = `root/${filePath}`
    }

    setFiles([...files, filePath])
    setNewFile('')
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

            <InputWrapper>
              <label>Files</label>
              <FileList>
                {files.map((file, index) => (
                  <FileItem key={index}>
                    <span title={file.replace('root/', '')}>{file.replace('root/', '')}</span>
                    <Button onClick={() => handleRemoveFile(file)} appearance="text">
                      <X size={14} color="var(--color-black-6)" />
                    </Button>
                  </FileItem>
                ))}
              </FileList>

              <AddFile>
                <Input
                  type="text"
                  value={newFile}
                  onChange={e => setNewFile(e.target.value)}
                  placeholder="Enter file path"
                />
                <Button onClick={handleAddFile} style={{ padding: '5px' }}>
                  <Plus size={16} strokeWidth={3} />
                </Button>
              </AddFile>
            </InputWrapper>

            <Button onClick={handleUpdate}>Save</Button>

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