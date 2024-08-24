import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  height: calc(100svh - calc(var(--layout-margin) * 2));
  width: var(--dir-panel-width);
  background-color: var(--color-black-2);
  border-radius: 0 calc(var(--c-border-radius) * 1.2) calc(var(--c-border-radius) * 1.2) 0;
`

function DirectoryPanel() {
  return (
    <Wrapper>
    </Wrapper>
  )
}

export default DirectoryPanel
