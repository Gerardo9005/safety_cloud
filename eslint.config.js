import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // AÑADIR/MODIFICAR REGLAS ESPECÍFICAS AQUÍ
    rules: {
        // Regla para que ESLint ignore la variable "_" capturada en el catch
        '@typescript-eslint/no-unused-vars': [
            'error', // O 'warn'
            {
                // Este patrón le dice al linter que ignore las variables
                // capturadas en bloques 'catch' que empiezan por un guion bajo.
                'caughtErrorsIgnorePattern': '^_'
            }
        ]
    }
  },
])