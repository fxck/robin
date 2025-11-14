import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: [
      '.nitro/**/*',  // Ignore Nitro generated files
      'dist/**/*',
      '.output/**/*',
    ],
  },
];
