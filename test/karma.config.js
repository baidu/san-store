var webpackConfig = require('./webpack.config.js');


module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      './index.js'
    ],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    browsers: ['ChromeHeadless'],
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox']
        }
    },
    reporters: ['progress'],
    singleRun: true,
  })
};



