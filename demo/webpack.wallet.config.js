const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    wallet: path.resolve(__dirname, './src/wallet/main.ts'),
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name]/main.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/wallet/index.html'),
      filename: path.resolve(__dirname, './dist/wallet/index.html'),
      chunks: ['wallet'],
      publicPath: '../'
    }),
   ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    // compress: true,
    hot: true,
    port: 8081,
    allowedHosts: "all",
    client: {
      overlay: false,
    },
    devMiddleware: {
      writeToDisk: (filePath) => {
        let fileName = filePath.split('/');
        filename = fileName[fileName.length - 1];

        return path.join(__dirname, 'dist', filename);
      },
    },
  },
};