import baseConfig from '@workspace/eslint-config/base.js'

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
      },
    },
  },
] 