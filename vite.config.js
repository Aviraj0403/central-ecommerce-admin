import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: true, 
    allowedHosts: ['all'], // Use an array for allowedHosts
  }
});
