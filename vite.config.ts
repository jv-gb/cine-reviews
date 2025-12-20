import process from 'process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true
    },
    // Expõe as variáveis de ambiente para o cliente
    define: {
      'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(env.VITE_TMDB_API_KEY)
    }
  }
})