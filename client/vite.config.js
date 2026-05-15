import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Configuración principal de Vite
 * https://vite.dev/config/
 */
export default defineConfig({
  // El plugin de React permite que Vite entienda JSX y el Fast Refresh (recarga rápida)
  plugins: [react()],
  
  server: {
    // Definimos el puerto 5173 (predeterminado de Vite) para consistencia
    port: 5173,
    // Abrir el navegador automáticamente al iniciar el comando npm run dev
    open: true,
  },

  /* 
     Si en el futuro decides usar alias (ejemplo: import '@components/Navbar'), 
     aquí es donde se configurarían para que el código sea más limpio.
  */
})