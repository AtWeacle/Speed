import { useEffect } from 'react'

import useStore from '@weacle/speed-client/lib/useStore'
import { STORE_NAME } from '@weacle/speed-lib/constants'
import { SERVER_URL } from '@weacle/speed-client/lib/constants'

function BackupManager() {
  const state = useStore(state => state)

  useEffect(() => {
    function checkAndSendBackup() {
      if (!state) return

      const { lastBackupAt, setLastBackupAt } = useStore.getState()

      const now = new Date()
      const lastBackup = lastBackupAt ? new Date(lastBackupAt) : null

      if (!lastBackup || now.getDate() !== lastBackup.getDate()) {
        const storedState = localStorage.getItem(STORE_NAME)
        if (!storedState) return

        fetch(`${SERVER_URL}/api/app/backup`, {
          method: 'POST',
          body: JSON.stringify({ state: storedState }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        setLastBackupAt(now.toISOString())
      }
    }

    checkAndSendBackup()
  }, [state])

  return null
}

export default BackupManager