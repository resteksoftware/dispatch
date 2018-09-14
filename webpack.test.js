var nodeExternals = require('webpack-node-externals');
// var config = require('./webpack.dev.js');

module.exports = {
  target: 'node', // webpack should compile node compatible code
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
};
