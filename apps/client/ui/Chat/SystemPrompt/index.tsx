import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Maximize2,
  X,
} from 'lucide-react'

import useStore from '@weacle/speed-client/lib/useStore'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: calc(100% - 10px);
`
const DialogContent = styled(Dialog.Content)`
  .Textarea#systemPrompt {
    width: calc(100% - 20px);
    margin: 15px 0 0;
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    padding: 10px;
    font-size: .9rem;
    line-height: 1.3;
    color: var(--color-black-9);
    border: 1px solid var(--color-black-5);
    resize: vertical  ;
  }

  .Textarea#systemPrompt:focus {
    outline: 2px solid var(--color-deepblue);
  }

  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes contentShow {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
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
          <button className="Button" style={{ fontSize: '.85rem', fontWeight: '600' }}>System prompt <Maximize2 size={14} strokeWidth={2.3} style={{ marginLeft: '8px'}} /></button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <DialogContent className="DialogContent">
            <Dialog.Description style={{ display: 'none' }}>System prompt</Dialog.Description>
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
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Wrapper>
  )
}
