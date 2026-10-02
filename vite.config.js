import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base para GitHub Pages (https://ponchy-k.github.io/Equipo-BoogieBomb-13-14/).
// En desarrollo se sirve desde la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Equipo-BoogieBomb-13-14/' : '/',
  plugins: [react(), tailwindcss()],
}))
