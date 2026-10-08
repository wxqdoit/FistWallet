import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        crx({ manifest }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@core': path.resolve(__dirname, './src/core'),
            '@store': path.resolve(__dirname, './src/store'),
            '@services': path.resolve(__dirname, './src/services'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@types': path.resolve(__dirname, './src/types'),
            '@assets': path.resolve(__dirname, './src/assets'),
        },
    },
    define: {
        'global': 'globalThis',
        'process.env': {},
    },
    build: {
        rollupOptions: {
            input: {
                popup: 'index.html',
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('buffer') || id.includes('base64-js') || id.includes('ieee754')) {
                            return 'vendor-buffer';
                        }
                        if (id.includes('@phosphor-icons')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('@radix-ui') || id.includes('framer-motion') || id.includes('sonner')) {
                            return 'vendor-ui';
                        }
                        if (id.includes('@tanstack/react-query')) {
                            return 'vendor-query';
                        }
                        if (id.includes('react-dom')) {
                            return 'vendor-react-dom';
                        }
                        if (id.includes('react-router') || id.includes('react')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@noble') || id.includes('@scure') || id.includes('bip39')) {
                            return 'vendor-crypto';
                        }
                    }
                },
            },
        },
        chunkSizeWarningLimit: 2500,
    },
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            port: 5173,
        },
    },
});
