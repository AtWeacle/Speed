import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_CLIENT_PORT ? Number(process.env.VITE_CLIENT_PORT) : 5173,
  }
})
