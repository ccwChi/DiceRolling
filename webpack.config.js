const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');  //為了热模塊多打的
const webpack = require('webpack');   //為了热模塊多打的

module.exports = {
  mode: "development",
  
  devtool: "eval-source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devServer: {
    hot: false, // 啟用熱模組替換
    client: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              publicPath: 'images/',
            },
          },
        ]
      }
    ], 
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
   // Plugin for hot module replacement
   new webpack.HotModuleReplacementPlugin(),
  ],

};