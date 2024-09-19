const webpack = require('webpack');
const path = require('path');


module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert/'),
    buffer: require.resolve('buffer/')

  };
  config.output.path = path.resolve(__dirname, 'static');
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
  }),
  ]);
  return config;
};