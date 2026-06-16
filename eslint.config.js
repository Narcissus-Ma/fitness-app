import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.wrangler/**', '**/.superpowers/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        React: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        Headers: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        KVNamespace: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        window: 'readonly',
        document: 'readonly',
        import: 'readonly',
      },
    },
    rules: {
      'no-eval': 'error',
      'no-with': 'error',
      'no-unused-vars': 'off',
    },
  },
];
