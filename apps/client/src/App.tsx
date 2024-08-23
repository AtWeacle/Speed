import styled from 'styled-components'

import Chat from '@weacle/speed-client/ui/Chat'
import ConnectionManager from '@weacle/speed-client/ui/ConnectionManager'
import './App.css'

const Layout = styled.div`
  display: flex;
  height: 100vh;
`

function App() {
  return (
    <>
      <ConnectionManager />

      <Layout>
        <Chat />
        {/* <DirectoryPanel /> */}
      </Layout>
    </>
  )
}

export default App
