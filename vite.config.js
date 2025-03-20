import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.1.215:8000', // Replace this with your API server URL
        changeOrigin: true,
        secure: false, // Set this to true if your API server is using HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''), // Optionally remove /api from the request path
      },
    },
  },
});
