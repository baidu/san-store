
# todos-multiple-store

> 这是一个 San 的多页面脚手架产生的项目，适合多页面项目，支持 Smarty 和静态 HTML 做 layout 框架。
> PS：webapp 是分为框架页面和接口的，**layout 框架** 指 webapp 的承接框架的 HTML 页面，比如 Smarty 输出框架

## Build Setup

``` bash
# install dependencies
npm install
# or
yarn


# serve with hot reload at localhost:9003
npm start
# or
yarn start

# build for production with minification
npm run build
# or
yarn build
```
更多命令查看`package.json`的`scripts`字段。

## 最佳实践&解决方案
> [本地实现 Mock Server](https://www.npmjs.com/package/hulk-mock-server) 两种

### Mock Server
Mock Server 实现涉及到代码和说明
```
├── mock    mock 文件
│   ├── _data_  这里是JSON 数据，跟template 目录结构一致，支持 Mockjs 语法（**.mock.json）
│   └── index.js 配置文件
```





### 模板引擎
如果不使用 smarty，直接 html，则使用`pages.template.ejs`生成对应的页面 html，放到`output/_html`中，本地开发通过`localhost:port/_html`访问


```css
// input
// pr 是真实设计稿测量出来的宽度
h2 {
    margin: 1242pr 1242pr 40px 50px;
    font-size: 32px;
}

// output
h2 {
    margin: 20rem 20rem 40px 50px;
    font-size: 32px;
}
```
## 目录说明
```
├── mock
├── scripts
├── src
│   ├── services       # 公共service请求
│   ├── assets         # 公共资源
│   │   └── font
│   ├── components     # 公共UI组件
│   │   └── demo
│   ├── layouts      
│   ├── lib            # lib 库
│   │   ├── app.js
│   │   ├── fetch.js
│   │   └── utils
│   ├── natives        # 端能力统一在这里管理
│   ├── pages          # 页面相关，后面详细讲解
│   │   └── demo
├── template
│   ├── base.tpl
│   └── demo
│       └── index.tpl
├── node_modules
├── public
├── output
├── docs
├── README.md
├── build.sh
├── package.json
├── pages.template.ejs
├── postcss.config.js
└── san.config.js
```
#### pages
```
pages
└── demo                # demo 页面
    ├── assets          # demo 页面用到的资源
    ├── components      # demo 页面用到的 UI 组件
    │   ├── comment
    │   └── publisher
    ├── index.js        # demo 入口文件
    ├── index.scss
    └── services        # demo 用到的接口请求 services
        └── index.js
```

### 页面接口使用
使用 [axios](https://www.npmjs.com/package/axios)，在  `pages/xx/services` 文件夹下开发接口请求，例如：

```js
import {get, post} from 'axios';
export default {
    getData() {
        return get('/api/getData');
    },
    publish(data) {
        return post('/api/publish', data);
    }
}
```

**如果项目公共的 api 请求，请放在`src/services`下面统一维护**

### dotFile 配置

* eslintrc：eslint
* browserlistrc：browserlist配置
* babelrc：babel 配置
* editorconfig：不需要修改，设置了 tab 4个空格等，常见规范类的配置
* npmrc：不需要修改，注册@baidu registry
* prettierrc：根据需要修改，格式化插件
* gitignore：git 忽略
