const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const qiankunMode = process.env.QIANKUN_DEV_MODE === 'host';
const rollbackMode = process.env.ROLLBACK_ENTRY_MODE === 'true';

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
    library: 'subappVue3Wms',
    libraryTarget: 'umd',
    globalObject: 'window',
    publicPath: 'http://localhost:7202/',
    clean: true,
  },
  devServer: {
    port: 7202,
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
