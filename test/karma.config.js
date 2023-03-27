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
    // browsers: ['Chrome'], // 调试时开启
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox']
        }
    },
    reporters: ['progress'],
    singleRun: true,
    // singleRun: false, // 调试时开启
  })
};



