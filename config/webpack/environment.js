const { environment } = require('@rails/webpacker');
const webpack = require('webpack');
const path = require('path');

const customConfig = {
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, '..', '..', 'app/javascript/src'),
    },
    extensions: ['.js', '.jsx', '.mjs', '.json']
  }
};
environment.config.merge(customConfig);
environment.splitChunks();

environment.plugins.prepend(
  'Environment',
  new webpack.EnvironmentPlugin({
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || ''
  })
);

module.exports = environment;
