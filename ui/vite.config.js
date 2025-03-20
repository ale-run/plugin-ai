import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import commonjs from '@rollup/plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { createVuePlugin } from 'vite-plugin-vue2';
import { createSvgPlugin } from 'vite-plugin-vue2-svg';
import path from 'path';

export default defineConfig({
  plugins: [
    createVuePlugin(),
    createSvgPlugin({
      svgoConfig: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false
              }
            }
          }
        ]
      }
    }),
    nodePolyfills({
      include: ['stream']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AIAssistant',
      fileName: (format) => `ai-assistant.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      external: ['vue', '@ale-run/connector'],
      output: {
        globals: {
          'vue': 'Vue',
          '@ale-run/connector': 'AleConnector'
        }
      },
      plugins: [commonjs()]
    },
    outDir: 'dist',
    sourcemap: true
  }
});
