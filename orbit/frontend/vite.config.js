import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The app calls the API at the relative path '/api'. In production Express
    // serves the built frontend, so that path resolves on its own. During `npm run dev`
    // the frontend is on 5173 and the backend on 5000, so proxy the API across.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
