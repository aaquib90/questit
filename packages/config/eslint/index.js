import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

const sharedLanguageOptions = {
  ecmaVersion: 2022,
  sourceType: 'module',
  globals: {
    ...globals.browser,
    ...globals.node
  },
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true }
  }
};

const DEFAULT_IGNORES = ['dist', '.turbo', 'build', 'public'];

export default defineConfig([
  globalIgnores(DEFAULT_IGNORES),
  {
    name: '@questit/config/web',
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: DEFAULT_IGNORES,
    extends: [js.configs.recommended, reactHooks.configs['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: sharedLanguageOptions,
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  }
]);
