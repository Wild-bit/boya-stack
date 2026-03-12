import baseConfig from '../../eslint.config.mjs';

export default [
  { ignores: ['prisma.config.ts', 'escosystem.config.js'] },
  ...baseConfig,
];
