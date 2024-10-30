import React from 'react'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import Button from '@weacle/speed-client/ui/Button'
import useProjectStore from '@weacle/speed-client/lib/useProjectStore'
import Preset from './Preset'

const StyledContent = styled(Dialog.Content)`
  max-width: 400px;
  gap: 15px;
  display: flex;
  flex-direction: column;
`

const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

function SeePresets() {
  const presets = useProjectStore(state => state.fileSelectionPresets)

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="DialogOverlay" />
      <StyledContent className="DialogContent">
        <Dialog.Title className="DialogTitle">Presets</Dialog.Title>

        <PresetList>
          {presets.map(preset => (
            <Preset key={preset.id} preset={preset} />
          ))}
        </PresetList>

        <Dialog.Close asChild>
          <Button className="IconButton" aria-label="Close">
            <X size={24} />
          </Button>
        </Dialog.Close>
      </StyledContent>
    </Dialog.Portal>
  )
}

export default SeePresets