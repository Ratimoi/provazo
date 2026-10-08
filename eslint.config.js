const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    // Regras do React Compiler: apontam padrões que funcionam aqui (zerar
    // formulário ao abrir o modal, Animated.Value em useRef). Ficam como
    // aviso pra não travar o CI nem forçar reescrita sem ganho.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]);
