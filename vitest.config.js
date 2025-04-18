    // vitest.config.js
    import { defineConfig } from 'vitest/config';
    import vue from '@vitejs/plugin-vue';

    export default defineConfig({
      plugins: [vue()],
      test: {
        globals: true,
        environment: 'happy-dom', // או 'jsdom'
        coverage: {
          provider: 'istanbul' // שנה ל-istanbul
          // reporters: ['text', 'json', 'html'], // אפשר להגדיר גם כאן
        },
      },
    });