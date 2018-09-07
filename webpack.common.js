/**
 * webpack.common.js
 *
 */

const path = require('path')
const SRC_DIR = path.join(__dirname, './src')
const DIST_DIR = path.join(__dirname, './dist-dispatch/')
const FAVI_PATH = path.join(__dirname, './src/assets/favicon.ico')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractSass = new ExtractTextPlugin({
  filename: 'styles.css'
})

module.exports = {
  entry: ['babel-polyfill', `${SRC_DIR}/index.js`],
  output: {
    path: DIST_DIR,
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: SRC_DIR,
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react', 'stage-2']
        }
      },
      {
        test: /\.*(sass|scss)$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader/?modules', 'sass-loader']
        })
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    extractSass,
    new HtmlWebpackPlugin({
      template: path.join(path.resolve(__dirname, './'), 'index.html'),
      favicon: FAVI_PATH
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  node: {
    fs: 'empty'
  }
}
