import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,                       // listen on 0.0.0.0 (required on Railway)
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,               // accept Railway's *.up.railway.app domain
  },
})
