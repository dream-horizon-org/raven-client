module.exports = {
  bracketSpacing: false,
  bracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  overrides: [
    {
      files: '*.spec.tsx',
      options: {
        breakBeforeExpression: true,
        breakAfterExpression: true,
      },
    },
  ],
}
