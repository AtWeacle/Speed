import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import '@weacle/speed-client/src/styles/root.css'
import '@weacle/speed-client/src/styles/button.css'
import '@weacle/speed-client/src/styles/dialog.css'
import '@weacle/speed-client/src/styles/select.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
