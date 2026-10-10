/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  semi: true,
  printWidth: 80,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^react$', '^next', '<THIRD_PARTY_MODULES>', '^@/', '^[./]']
};

export default config;