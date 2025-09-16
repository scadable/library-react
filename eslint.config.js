// ESLint flat config for TypeScript + React
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        WebSocket: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        global: 'readonly',
        Event: 'readonly',
        MessageEvent: 'readonly',
        CloseEvent: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['src/types.ts'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.storybook/'],
  },
];


