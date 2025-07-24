// rollup.config.js
// ESM Rollup configuration for a React library with `package.json` set to "type": "module".

import path from 'path';
import { fileURLToPath } from 'url';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
// Native ESM import of JSON using `with` assertion
import pkg from './package.json' with { type: 'json' };

// Derive __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  // Entry point of your library
  input: 'src/index.js', // or index.jsx / index.tsx

  // Output both CommonJS and ES module formats
  output: [
    {
      file: pkg.main,    // e.g., dist/index.cjs.js
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: pkg.module,  // e.g., dist/index.esm.js
      format: 'esm',
      sourcemap: true,
    },
  ],

  // Externalize peer dependencies to avoid bundling React, etc.
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
  ],

  plugins: [
    // Resolve node_modules packages
    resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),

    // Convert CommonJS modules to ES6
    commonjs(),

    // Transpile with Babel (JSX, modern JS syntax)
    // Ensure these presets are installed: @babel/preset-env, @babel/preset-react
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ],
    }),

    // Minify for production
    terser(),
  ],
};
