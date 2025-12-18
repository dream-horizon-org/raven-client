module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    '@react-native',
    'prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'react', // React linting
    'react-native', // React Native specific linting
    '@typescript-eslint', // TypeScript linting
    'prettier', // Prettier plugin to integrate with ESLint
    'import', // Import/export linting
    'unused-imports', // Unused imports linting
    'react-hooks',
  ],
  rules: {
    // Core rules
    'no-undef': 'off',
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    'no-void': 'off',
    'no-unsafe-optional-chaining': 'warn',
    'prefer-const': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    semi: 'off',

    // Console statements - allow for development
    'no-console': 'off', // Allow console statements in development

    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_'},
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // Import rules
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/newline-after-import': 'warn',
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
    'import/extensions': 'off',
    'import/no-duplicates': 'off',
    'import/no-named-as-default-member': 'off',
    'import/named': 'off',

    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'index',
          'parent',
          'sibling',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],

    // React Native specific
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',

    // Unused imports
    'unused-imports/no-unused-imports': 'warn',
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['registry/validations/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['src/generated/**/*.ts'],
      rules: {
        '@typescript-eslint/no-shadow': 'off',
      },
    },
  ],
}
