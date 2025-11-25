module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@mobile': './src',
            '@mobile/components': './src/components',
            '@mobile/screens': './src/screens',
            '@questit/ui': '../../packages/ui/src',
            '@questit/ui/native': '../../packages/ui/src/native',
            '@questit/toolkit': '../../packages/toolkit/src'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
