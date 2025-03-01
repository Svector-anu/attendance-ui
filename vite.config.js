import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This provides the Node.js process object to the browser environment
    'process.env': {},
    global: 'window',
  },
})