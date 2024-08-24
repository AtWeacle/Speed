import styled from 'styled-components'

import Chat from '@weacle/speed-client/ui/Chat'
import DirectoryPanel from '@weacle/speed-client/ui/DirectoryPanel'
import ConnectionManager from '@weacle/speed-client/ui/ConnectionManager'
import './App.css'

const Layout = styled.div`
  --dir-panel-width: 400px;
  --layout-margin: 5px;

  display: flex;
  gap: 1px;
  height: calc(100svh - calc(var(--layout-margin) * 2));
  width: calc(100svw - calc(var(--layout-margin) * 2));
  margin: var(--layout-margin);
`

function App() {
  return (
    <>
      <ConnectionManager />

      <Layout>
        <Chat />
        <DirectoryPanel />
      </Layout>
    </>
  )
}

export default App
