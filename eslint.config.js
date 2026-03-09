import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.next/',
    'out/',
    '.turbo/',
    '.vercel/',
    '**/*.min.js',
    '**/*.yaml',
    'supabase/.temp/',
    'public/**',
    'supabase/**',
  ]),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint.plugin,
      'react-refresh': reactRefresh,
      'boundaries': boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'boundaries/elements': [
        // L0: Shared Kernel (技术原语 + 跨领域业务概念)
        {
          type: 'L0_Primitives',
          pattern: ['src/shared/kernel', 'src/shared/domain', 'src/shared/utils', 'src/shared/types'],
          mode: 'folder',
        },
        // L1: 基础设施
        {
          type: 'L1_Infra',
          pattern: ['src/infra'],
          mode: 'folder',
        },
        // L2: Presentation Layer (共享 UI + Hooks + Context)
        {
          type: 'L2_UI_State',
          pattern: ['src/presentation'],
          mode: 'folder',
        },
        // L3: 业务特性
        {
          type: 'L3_Features',
          pattern: ['src/features', 'src/app'],
          mode: 'folder',
        },
      ],
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 架构边界规则 (Architecture Boundaries)
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'L0_Primitives',
              disallow: ['L1_Infra', 'L2_UI_State', 'L3_Features'],
              message: 'L0 (Primitives) 只能依赖外部库，严禁依赖上层模块',
            },
            {
              from: 'L1_Infra',
              disallow: ['L2_UI_State', 'L3_Features'],
              message: 'L1 (Infra) 只能依赖 L0，严禁依赖 UI 或 业务层',
            },
            {
              from: 'L2_UI_State',
              disallow: ['L3_Features'],
              message: 'L2 (Shared UI/State) 严禁依赖 L3 业务层',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['vitest.config.ts', 'vitest.setup.ts', 'middleware.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['scripts/**/*.cjs', 'scripts/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'off',
      'no-console': 'off',
    },
  },
])
