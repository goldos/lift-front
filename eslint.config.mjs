// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    {
      ignores: ['dist/', '.angular/'],
    },
    eslint.configs.recommended,
    {
      files: ['**/*.ts'],
      extends: [
        ...tseslint.configs.recommended,
        ...angular.configs.tsRecommended,
      ],
      processor: angular.processInlineTemplates,
      plugins: {
        prettier: prettierPlugin,
      },
      rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        '@angular-eslint/directive-selector': [
          'error',
          { type: 'attribute', prefix: 'app', style: 'camelCase' },
        ],
        '@angular-eslint/component-selector': [
          'error',
          { type: 'element', prefix: 'app', style: 'kebab-case' },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
      },
    },
    {
      files: ['**/*.html'],
      extends: [
        ...angular.configs.templateRecommended,
        ...angular.configs.templateAccessibility,
      ],
      plugins: {
        prettier: prettierPlugin,
      },
      rules: {
        'prettier/prettier': [
          'error',
          {
            parser: 'angular',
            endOfLine: 'auto',
          },
        ],
      },
    },
    prettierConfig,
);