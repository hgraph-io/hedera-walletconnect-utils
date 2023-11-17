const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    dApp: path.resolve(__dirname, './src/dApp/main.ts'),
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
    alias: {
      "@src": path.resolve(__dirname, "src"),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name]/main.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/dApp/index.html'),
        filename: path.resolve(__dirname, './dist/dApp/index.html'),
        chunks: ['dApp'],
        publicPath: '../'
    }),
    new CopyWebpackPlugin({
      patterns: [path.resolve(__dirname, 'src', 'index.html')]
    })
   ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    // compress: true,
    hot: true,
    port: 8080,
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