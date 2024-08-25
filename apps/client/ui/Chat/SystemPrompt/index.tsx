import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Maximize2,
  X,
} from 'lucide-react'

import useStore from '@weacle/speed-client/lib/useStore'
import './styles.css'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: calc(100% - 10px);
`
export default function SystemPrompt() {
  const setSystemPrompt = useStore(state => state.setSystemPrompt)
  const systemPrompt = useStore(state => state.systemPrompt)

  const saveSystemPrompt = () => {
    const systemPrompt = document.getElementById('systemPrompt') as HTMLTextAreaElement
    setSystemPrompt(systemPrompt.value)
  }

  return (
    <Wrapper>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className="Button">System prompt <Maximize2 size={14} strokeWidth={2.3} style={{ marginLeft: '8px'}} /></button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle">System Prompt</Dialog.Title>
            <textarea className="Textarea" rows={20} id="systemPrompt" defaultValue={systemPrompt} />
            <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
              <Dialog.Close asChild>
                <button className="Button" onClick={saveSystemPrompt}>Save changes</button>
              </Dialog.Close>
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
