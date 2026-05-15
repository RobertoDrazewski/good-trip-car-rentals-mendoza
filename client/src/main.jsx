import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/** 
 * ORDEN DE ESTILOS (Cascada)
 * Importamos index.css primero y App.css después para que 
 * tus diseños originales tengan prioridad.
 */
import './index.css' 
import './App.css'  

// Configuración de i18next para las traducciones
import './i18n'; 

/**
 * Montaje de la aplicación en el DOM
 * Se utiliza StrictMode para capturar errores potenciales en desarrollo.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)