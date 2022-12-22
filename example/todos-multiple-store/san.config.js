/**
 * @file san config
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 *
 * 环境变量, scripts/preview.js脚本中定义
 * COM_PAGE: 组件类型默认情况下, 组件路径是src/components; 值为src/pages中有效目录时, 路径为src/pages/$COM_PAGE/components
 * COM_NAME: 组件名称, 默认avatar
 */
const path = require('path');

// 静态文件域名
const CDN = 'https://s.bdstatic.com/';

// 生产环境下的静态目录
const STATIC_PRO = 'static/todos-multiple-store';

const resolve = pathname => path.resolve(__dirname, pathname);

// 这个是 release 目录，打包机器只能支持 output，所以谨慎修改
const outputDir = 'output';
const isProduction = process.env.NODE_ENV === 'production';


module.exports = {
    assetsDir: isProduction ? STATIC_PRO : 'static',
    publicPath: isProduction ? CDN : '/',
    outputDir,
    // 文件名是否 hash
    filenameHashing: isProduction,
    // 这是多页面配置
    pages: {
        index: {
            entry: './src/index.js',
            template: './pages.template.ejs',
            filename: 'index.html'
        }
    },
    // 默认node_modules的依赖是不过 babel 的
    // 如果依赖是 ESM 版本，要过 babel，请开启这里
    // transpileDependencies:['@baidu/nano'],
    css: {
        sourceMap: isProduction,
        cssPreprocessor: 'less',
        // 以下配置可强制所有css文件开启css modules
        // loaderOptions: {
        //     css: {
        //         modules: {
        //             auto: () => true
        //         }
        //     }
        // }
    },
    // 如使用.san单文件且默认全部css文件开启css modules，则需要开启esModule
    // esModule: true,
    splitChunks: {
        // splitChunks 配置
        // chunks name 如果要在 page 中使用：
        // 如果拆的 chunk 不在 page 中，
        // 那么需要添加 page 的 chunks:[${chunk-name}]
        cacheGroups: {
            vendors: {
                name: 'vendors',
                test: /[\\/]node_modules(?!\/@baidu)[\\/]/,
                // minChunks: 1,
                chunks: 'initial',
                priority: -10
            }
        }
    },
    alias: {
        '@assets': resolve('src/assets'),
        '@components': resolve('src/components'),
        '@store': resolve('src/lib/Store.js'),
        '@app': resolve('src/lib/App.js')
    },
    chainWebpack: config => {
        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法

        // config.module.rule('img')
        //     .test(/\.(png|jpe?g|gif)(\?.*)?$/)
        //     .use('url-loader').loader(require.resolve('url-loader'))
        //     .options({
        //         limit: 1000,
        //         name: STATIC_PRO + '/img/[name].[contenthash:7].[ext]',
        //         publicPath: isProduction ? CDN : ''
        //     });
    },
    cache: false,
    sourceMap: isProduction
};
