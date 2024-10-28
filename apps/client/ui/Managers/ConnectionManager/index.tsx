import useWebSocket from 'react-use-websocket'

import { WS_URL } from '@weacle/speed-client/lib/constants'

function ConnectionManager() {
  useWebSocket(WS_URL, {
    share: true,
    onOpen: () => {
      console.log('WebSocket connection established.')
    }
  })

  return null
}

export default ConnectionManager
