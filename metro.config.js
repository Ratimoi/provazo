const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permite importar arquivos .sql como texto — usado pelas migrations do Drizzle
config.resolver.sourceExts.push('sql');

module.exports = config;
