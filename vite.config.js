import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// נתיב מוחלט לקובץ הכניסה
const entryPath = path.resolve(__dirname, 'src/index.js');

// הדפס את הנתיב כדי לבדוק שהוא נכון
console.log('Entry path:', entryPath);

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: entryPath,
      name: 'FormVHtml',
      fileName: (format) => `form-v-html.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});