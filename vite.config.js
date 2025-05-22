import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
<<<<<<< Updated upstream
        target: 'http://192.168.1.215:8000', // Replace this with your API server URL
=======
        target: 'http://192.168.1.89/api/v1:8000',
>>>>>>> Stashed changes
        changeOrigin: true,
        secure: false, // Set this to true if your API server is using HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''), // Optionally remove /api from the request path
      },
<<<<<<< Updated upstream
    },
  },
});
=======
      '/whoami': {
        target: 'http://192.168.1.89:8000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/login': {
        target: 'http://192.168.1.89:8000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/logout': {
        target: 'http://192.168.1.89:8000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      }
    }
  }
});
>>>>>>> Stashed changes
