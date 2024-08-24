import styled from 'styled-components'

import Chat from '@weacle/speed-client/ui/Chat'
import Nav from '@weacle/speed-client/ui/Nav'
import DirectoryPanel from '@weacle/speed-client/ui/DirectoryPanel'
import ConnectionManager from '@weacle/speed-client/ui/ConnectionManager'

const Layout = styled.div`
  --dir-panel-width: 400px;
  --layout-margin: 5px;

  display: flex;
  gap: 1px;
  height: calc(100svh - calc(var(--layout-margin) * 1) - var(--nav-height));
  width: calc(100svw - calc(var(--layout-margin) * 2));
  margin: 0 var(--layout-margin) var(--layout-margin);
`

function App() {
  return (
    <>
      <ConnectionManager />

      <Nav />

      <Layout>
        <Chat />
        <DirectoryPanel />
      </Layout>
    </>
  )
}

export default App
