import styled from 'styled-components'

import useStore from '@weacle/speed-client/lib/useStore'

import Chat from '@weacle/speed-client/ui/Chat'
import CreateProject from '@weacle/speed-client/ui/Project/Create'
import Nav from '@weacle/speed-client/ui/Nav'
import RightPanel from '@weacle/speed-client/ui/Panels/Right'
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
  const projects = useStore(state => state.getProjects())

  return (
    <>
      <ConnectionManager />

      <Nav />

      {projects?.length ? <Layout>
          {/* <Chat /> */}
          {/* <RightPanel /> */}
        </Layout>
      : <Layout>
        <CreateProject />
      </Layout>}
    </>
  )
}

export default App
