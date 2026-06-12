const js = require('@eslint/js');
const playwright = require('eslint-plugin-playwright');
const jsonc = require('eslint-plugin-jsonc');
const jsoncParser = require('jsonc-eslint-parser');
const tsParser = require('@typescript-eslint/parser');

const sharedRules = {
  complexity: 'off',
  'max-len': 'off',
  'max-params': [2, 4],
  'max-statements': 'off',
  'max-depth': 'off',
  'max-nested-callbacks': 'off',
  indent: [2, 2],
  'linebreak-style': [2, 'unix'],
  'space-before-function-paren': [2, 'always'],
  curly: [2, 'all'],
  'brace-style': [2, '1tbs'],
  quotes: [1, 'single', 'avoid-escape'],
  eqeqeq: [2, 'allow-null'],
  semi: [2, 'always'],
  'new-cap': 0,
  'no-console': 'off',
  'no-empty': 0,
  'no-unused-vars': 1,
  'space-before-blocks': [2, 'always'],
  'keyword-spacing': [
    2,
    {
      before: true,
      after: true,
      overrides: {}
    }
  ],
  'no-trailing-spaces': [
    2,
    {
      skipBlankLines: false
    }
  ],
  'playwright/no-wait-for-timeout': 'off',
  'playwright/no-wait-for-selector': 'off',
  'playwright/no-page-pause': 'off',
  'playwright/no-standalone-expect': 'off',
  'playwright/prefer-locator': 'off',
  'playwright/prefer-web-first-assertions': 'off',
  'eol-last': ['error', 'never']
};

module.exports = [
  {
    ignores: ['node_modules/**', '.features-gen/**', 'playwright-report/**']
  },
  js.configs.recommended,
  playwright.configs['flat/recommended'],
  ...jsonc.configs['flat/recommended-with-json'],
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        page: 'readonly',
        expect: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    },
    rules: sharedRules
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        page: 'readonly',
        expect: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    },
    rules: sharedRules
  },
  {
    files: ['**/*.{json,json5,jsonc}'],
    languageOptions: {
      parser: jsoncParser
    },
    rules: {
      'jsonc/array-bracket-newline': [
        'error',
        {
          multiline: true,
          minItems: null
        }
      ],
      'jsonc/object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false
        }
      ],
      'jsonc/object-curly-newline': [
        'error',
        {
          multiline: true,
          minProperties: 1
        }
      ],
      'jsonc/array-bracket-spacing': ['error', 'never'],
      'jsonc/array-element-newline': ['error', 'consistent'],
      'jsonc/object-curly-spacing': 2,
      'jsonc/indent': ['error', 2, {}]
    }
  }
];