import styled from 'styled-components'

import SystemPrompt from '@weacle/speed-client/ui/Chat/SystemPrompt'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 60px;
  width: calc(100% - 20px);
  background-color: var(--color-black-2);
  border-radius: 0 calc(var(--border-radius) * 1.2) 0 0;
`

function Settings() {
  return (
    <Wrapper>
      <SystemPrompt />
    </Wrapper>
  )
}

export default Settings
