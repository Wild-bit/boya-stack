import baseConfig from '../../eslint.config.mjs';

export default [
  { ignores: ['prisma.config.ts', 'ecosystem.config.js'] },
  ...baseConfig,
];
