

const path = require('path');

let config = {
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]',
        publicPath: '/test',
        library: 'sanStore',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },


    resolve: {
        alias: {

            'san-store/use': path.resolve(__dirname, '../src/use.js'),
            'san-store': path.resolve(__dirname, '../dist/san-store.source.js'),
            'san-composition': path.resolve(__dirname, '../node_modules/san-composition/index.js')
        }
    }
};

config.entry = {};
config.entry['index.js'] = './test/index.js';



module.exports = exports = config;


