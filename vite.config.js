// filepath: vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
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