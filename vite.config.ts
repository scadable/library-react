import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            include: ['src/**/*'],
            exclude: ['src/**/*.stories.*', 'src/**/*.test.*', '__tests__/**/*']
        })
    ],
    build: {
        lib: {
            entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
            name: 'Scadable',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        }
    }
});