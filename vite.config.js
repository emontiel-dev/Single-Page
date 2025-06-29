// filepath: vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Configura la URL base para GitHub Pages
  // Reemplaza '/Single-Page/' con el nombre exacto de tu repositorio si es diferente
  base: '/Single-Page/',

  // Opciones de configuración de Vite (si las necesitas)
  // Por ejemplo, si tu index.html no está en la raíz:
  // root: './src',
  // build: {
  //   outDir: '../dist',
  // },
  server: {
    host: true // Esto expone el servidor a la red local
  }
});