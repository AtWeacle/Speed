import styled from 'styled-components'

import Settings from '@weacle/speed-client/ui/Panels/Right/Settings'
import Directory from '@weacle/speed-client/ui/Panels/Right/Directory'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  height: calc(100svh - calc(var(--layout-margin) * 2)- var(--nav-height));
  width: var(--dir-panel-width);
  /* background-color: var(--color-black-2); */
  /* border-radius: 0 calc(var(--border-radius) * 1.2) calc(var(--border-radius) * 1.2) 0; */
`

function RightPanel() {
  return (
    <Wrapper>
      <Settings />
      <Directory />
    </Wrapper>
  )
}

export default RightPanel
