import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Полифиллы для всех Node.js модулей которые использует Solana
      include: [
        'buffer',
        'crypto',
        'stream',
        'util',
        'process',
        'events',
        'path',
        'url',
        'http',
        'https',
        'assert',
        'os',
        'zlib'
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': '/src',
      // Добавляем алиасы для проблемных модулей
      'stream': 'stream-browserify',
      'crypto': 'crypto-browserify',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global polyfills для esbuild
      define: {
        global: 'globalThis',
      },
    },
    // Включаем проблемные пакеты в оптимизацию
    include: [
      'buffer',
      '@solana/web3.js',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets'
    ],
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Force cache busting with timestamps + manualChunks
        entryFileNames: `[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `[name]-[hash]-${Date.now()}.[ext]`,
        manualChunks: {
          // Включаем все Solana пакеты в отдельный chunk для правильной работы
          solana: [
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui', 
            '@solana/wallet-adapter-wallets',
            '@solana/web3.js'
          ],
        },
      },
      external: [
        // Exclude problematic Trezor packages
        '@trezor/connect-web',
        '@trezor/connect-common',
      ],
    },
    commonjsOptions: {
      ignore: ['@trezor/connect-web', '@trezor/connect-common'],
      transformMixedEsModules: true,
    },
  },
})
