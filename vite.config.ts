import process from 'process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  return {
    base: isProduction ? '/cine-reviews/' : '/',
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true
    },
    define: {
      'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(env.VITE_TMDB_API_KEY)
    }
  }
})
