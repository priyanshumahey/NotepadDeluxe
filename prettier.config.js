/** @type {import('prettier').Config} */
module.exports = {
  endOfLine: 'auto',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^types$',
    '^@/types/(.*)$',
    '^@/config/(.*)$',
    '^@/lib/(.*)$',
    '^@/hooks/(.*)$',
    '^@/components/ui/(.*)$',
    '^@/components/(.*)$',
    '^@/styles/(.*)$',
    '^@/app/(.*)$',
    '',
    '^[./]',
    '',
    '<TYPES>^[./]',
    '<TYPES>^react',
    '<TYPES>^next',
    '<TYPES>^@/',
    '<TYPES>',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.1.6',
  tailwindFunctions: ['cn', 'cva'],
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
};
