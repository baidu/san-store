
let config = require('../webpack.config');
const glob = require('glob');
const path = require('path');


config.entry = {};

glob.sync('test/*.spec.js').forEach(function (specJS) {
    config.entry[path.basename(specJS)] = './' + specJS;
});

config.entry['index.js'] = './test/index.js';

config.output.filename = '[name]';
config.output.publicPath = '/test';


module.exports = exports = config;


