// ESLint flat config (ESLint 9) con la config oficial de Expo.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'node_modules/*', 'scripts/*'],
  },
  {
    rules: {
      // useCountUp anima por frame (setState en efecto es intencional y acotado): warning, no error.
      'react-hooks/set-state-in-effect': 'warn',
      // Comillas en texto en español son válidas; regla puramente estilística.
      'react/no-unescaped-entities': 'off',
    },
  },
];
