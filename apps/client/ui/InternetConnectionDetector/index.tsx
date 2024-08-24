import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Error = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(var(--color-red-rgb), .08);
  color: var(--color-red);
  border: 1px solid rgba(var(--color-red-rgb), .1);
  white-space: pre-wrap;
  padding: 10px 15px;
  border-radius: calc(var(--c-border-radius) * .7);
  font-size: .85rem;
  font-weight: 600;

  p {
    margin: 0;
  }
`
export default function InternetConnectionDetector(): JSX.Element {
  const [isConnected, setIsConnected] = useState<boolean>(true)

  useEffect(() => {
    setIsConnected(navigator.onLine)
  }, [])

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(navigator.onLine)
    }

    window.addEventListener('online', updateConnectionStatus)
    window.addEventListener('offline', updateConnectionStatus)

    return () => {
      window.removeEventListener('online', updateConnectionStatus)
      window.removeEventListener('offline', updateConnectionStatus)
    }
  }, [])

  if (isConnected) return <></>

  return (
    <Error>
      <p>Internet connection status: <b>{isConnected ? 'Online' : 'Offline'}</b></p>
    </Error>
  )
}
