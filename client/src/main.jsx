import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Configuración de i18next para las traducciones de Mendoza Rent-a-car
import './i18n'; 

/** * 🎨 CONTROL DE CASCADA EN PRODUCCIÓN (Render Optimized)
 * Importamos App.css primero e index.css al final. 
 * Esto asegura que si index.css contiene las directivas de Tailwind o estilos globales del sitio,
 * el compilador de Vite en la nube los procese en el orden correcto y no te rompa ningún diseño premium.
 */
import './App.css'  
import './index.css' 

/**
 * Montaje de la aplicación en el DOM
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)