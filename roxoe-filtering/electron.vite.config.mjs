import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Electron main process için yapılandırma
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: resolve(__dirname, 'src/main/index.js'),
        output: {
          entryFileNames: 'index.js',
          format: 'cjs' // CommonJS formatında çıkış
        }
      }
    }
  },

  // Preload process için yapılandırma
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: resolve(__dirname, 'src/preload/index.js'),
        output: {
          entryFileNames: 'index.js',
          format: 'cjs'
        }
      }
    }
  },

  // React renderer için yapılandırma
  renderer: {
    base: './', // Dosya yollarının göreceli olmasını sağlar
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer')
      }
    },
    plugins: [react()],
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html'),
        output: {
          entryFileNames: 'index.js',
          format: 'esm'
        }
      },
      emptyOutDir: true
    }
  }
})
