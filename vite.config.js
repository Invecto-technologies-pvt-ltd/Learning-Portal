import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://kindly-more-bulldog.ngrok-free.app/', // Your backend API URL
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: Removes '/api' prefix if needed
      }
    }
  }
});
