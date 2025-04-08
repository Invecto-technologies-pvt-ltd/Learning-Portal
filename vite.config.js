import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://192.168.1.170:8080',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/whoami': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/logout': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      }
    }
  }
});