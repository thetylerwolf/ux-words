var path = require('path');
    module.exports = {
        entry: './index.js',
        output: {
            path: __dirname,
            filename: 'bundle.js'
        },
        module: {
            loaders: [
                { 
                  loader: 'babel-loader',
                  query: {
                    presets: ['es2015']
                  },
                  exclude: /node_modules/
              }
            ]
        }
    };