const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const qiankunMode = process.env.QIANKUN_DEV_MODE === 'host';
const rollbackMode = process.env.ROLLBACK_ENTRY_MODE === 'true';
const port = rollbackMode ? 7211 : 7201;
const publicPath = 'http://localhost:' + port + '/';

module.exports = {
  entry: path.resolve(__dirname, 'src/main.js'),
  resolve: {
    alias: {}
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  externalsType: 'window',
  externals: {
    '@host/runtime-vendor': 'HostRuntimeVendor',
  },
  output: {
    library: 'subappVue2Legacy',
    libraryTarget: 'umd',
    globalObject: 'window',
    publicPath,
    clean: true,
  },
  devServer: {
    port,
    historyApiFallback: true,
    hot: !qiankunMode,
    liveReload: !qiankunMode,
    static: {
      directory: __dirname,
    },
    client: {
      reconnect: !qiankunMode,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ROLLBACK_ENTRY_MODE': JSON.stringify(rollbackMode ? 'true' : 'false'),
      'process.env.APP_RUNTIME_CHANNEL': JSON.stringify(rollbackMode ? 'rollback' : 'stable'),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
    }),
  ],
};
