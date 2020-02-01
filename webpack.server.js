const path = require('path');

module.exports = ()=> {
  return {
    target: 'node',
    entry: {
      server: './server/index.js'
    },
    output: {
      path: path.join(__dirname, './build/server'),
      filename: 'index.js'
    },
    optimization: {
      minimize: false
    }
  };
};