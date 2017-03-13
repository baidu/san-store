# san-router

[![NPM version](http://img.shields.io/npm/v/san-store.svg?style=flat-square)](https://npmjs.org/package/san-store)
[![License](https://img.shields.io/github/license/ecomfe/san-store.svg?style=flat-square)](https://npmjs.org/package/san-store)

[San](https://ecomfe.github.io/san/) 框架的官方应用状态管理套件。

> 提示：使用 san-store 需要同时使用 [san-update](https://github.com/ecomfe/san-update) 2.x 创建状态变更器，san-store 将使用此变更器更新 store 中的应用状态。



下载
----

NPM:

```
$ npm i san-store
```


使用
----

### Webpack + Babel

通过 named import 导入

```javascript
import {store, connect} form 'san-store';
import {macro} from 'san-update';


store.addActions({
    changeUserName(name) {
        return macro().set('user.name', name);
    }
});


let UserNameEditor = san.defineComponent({
    submit() {
        store.dispatch('changeUserName', this.data.get('name'));
    }
});
connect.san({
    name: 'user.name'
})(UserNameEditor);
```

webpack 环境配置网上有太多文章，在此不赘述了


### AMD

通过 require 拿到的 exports 上包含 router 和 Link

```javascript
var sanStore = require('san-store');
var store = sanStore.store;
var connect = sanStore.connect;
var macro = require('san-update').macro;

store.addActions({
    changeUserName: function (name) {
        return macro().set('user.name', name);
    }
});


var UserNameEditor = san.defineComponent({
    submit: function () {
        store.dispatch('changeUserName', this.data.get('name'));
    }
});
connect.san({
    name: 'user.name'
})(UserNameEditor);
```

请为 amd loader 正确配置 san-store 的引用路径。通过 npm 安装的项目可以采用下面的配置

```javascript
require.config({
    baseUrl: 'src',
    paths: {
        'san-router': '../dep/san-store/dist/san-store.source'
    }
});
```



为什么要进行应用状态管理
----


Store和默认实例
----


Action
----



组件的connect
----

san-store 默认提供对 [San](https://ecomfe.github.io/san/) 组件的 connect 支持，步骤和 redux 类似：

1. 通过 `connect.san` 方法创建一个 connect 组件的函数
2. 调用这个函数对组件进行connect

```javascript
import {store, connect} form 'san-store';

let connector = connect.san(
    {name: 'user.name'},
    {change: 'changeUserName'}
);
connector(UserNameEditor);


// 通常我们只需要对当前声明的组件进行connect，可以合并成一句
connect.san(
    {name: 'user.name'},
    {change: 'changeUserName'}
)(UserNameEditor);
```


 `connect.san` 方法的签名为，mapStates, mapActions


### mapStates

`Object`

`mapStates` 参数指定了要把哪些状态注入到组件，key 是要注入到组件的数据项名称，value 是 store 中状态项的名称。

```javascript
import {store, connect} form 'san-store';


let UserNameEditor = san.defineComponent({
    // connect 后，name 数据项由 store 提供
    template: '<div title="{{name}}">......</div>'
});

connect.san(
    {name: 'user.name'}
)(UserNameEditor);
```


### mapActions

`Object`

通常我们在组件内通过调用 `store.dispatch(actionName, payload)` 方法更新应用状态，由于 actionName 的应用全局唯一性，名字需要比较完整，对于组件来说这么长的名称会显得比较冗余。通过 `mapActions` 可以在组件的 actions 成员上生成 dispatch action 的快捷方法，让组件可以更便捷的 dispatch action。


`mapActions` 的 key 是要映射到组件 actions 成员上的方法名，value 是 action 的名称。



```javascript
import {store, connect} form 'san-store';


let UserNameEditor = san.defineComponent({
    submit() {
        // 通过 mapActions，可以把 dispatch action 简化成组件自身的方法调用
        // store.dispatch('changeUserName', this.data.get('name'));
        this.actions.change(this.data.get('name'));
    }
});

connect.san(
    {name: 'user.name'},
    {change: 'changeUserName'}
)(UserNameEditor);
```





