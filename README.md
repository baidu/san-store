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
import {builder} from 'san-update';


store.addActions({
    changeUserName(name) {
        return builder().set('user.name', name);
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
var builder = require('san-update').builder;

store.addActions({
    changeUserName: function (name) {
        return builder().set('user.name', name);
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

啊？这还用说啊？


Store和默认实例
----

一个应用具有唯一的应用状态源，在一个地方管理整个应用的所有状态，是一个比较共识的方式。所以 san-store 提供了默认的 store 实例。绝大多数时候，应用开发者不需要手工创建自己的 Store 实例，只需要 import 默认的 store 实例。

```javascript
import {store} form 'san-store';
```

通过 `get` 方法，可以获取 store 中的状态数据。


```javascript
let appstates = store.get();
console.log(appstates.user.name);
```


store 并没有提供修改状态数据的方法，修改状态数据只能通过 dispatch action 来做到，具体细节请参考 [Action](#action) 章节。通过 `addAction` 或 `addActions` 方法可以添加 action。

```javascript
store.addAction('changeUserName', name => builder().set('user.name', name));


store.addActions({
    changeUserName(name) {
        return builder().set('user.name', name);
    }
});
```


当然，你也可以通过 new Store 创建自己的 Store 实例。创建时可以传入初始化数据和声明 actions。

```javascript
import {Store} form 'san-store';


let myStore = new Store({
    initData: {
        user: {
            name: 'your name'
        }
    },

    actions: {
        changeUserName(name) {
            return builder().set('user.name', name);
        }
    }
})
```

本节最后，还是要强调下，应用开发应当遵循 **一个应用具有唯一的应用状态源**。说白了就是 **要按常理出牌**。


Action
----

Action 是 san-store 最重要的组成部分之一，它：

1. 是 store 更新状态的唯一入口
1. 在一个 store 内每个 action 具有唯一名称，通过名称 dispatch
1. 是同步的，这使得状态更新可被记录、被追溯和重放


Action 是一个函数，通过 dispatch 执行。其接收一个 payload，返回一个 san-update 的 builder 对象。store 使用 builder 对象生成状态变更函数，并执行它，使 store 内部的状态得到更新。当然，如果当前 action 不期望对 store 的状态进行更新，可以不返回 builder 对象。

```javascript
store.addAction('changeUserName', name => builder().set('user.name', name));


store.addActions({
    initCount(count) {
        if (this.get().count == null) {
            return builder().set('count', count);
        }
    }
});
```

store.dispatch('initCount', 10);
```


san-update 是一个 Immutable 的更新对象库，其提供了一些更新函数（如set、push等），通过 `newObj = set(oldObj, 'x', 1)` 的使用形式让对象更新 Immutable。builder 是 san-update 提供的一个很好用的功能，通过 builder 你可以预定义一系列的数据更新操作，然后通过 `builder.build` 方法可以获得一个更新函数。san-store 就是利用这个功能，使用 action 返回的 builder 生成对象更新函数，再调用它进行 store 内部状态更新。

san-update 的 builder 支持预定义所有 san-update 支持的数据操作，常用的有：

- apply: 对现有数据项应用更新
- set: 设置数据项
- push: 数组push操作
- pop: 数组pop操作
- unshift: 数组unshift操作
- shift: 数组shift操作
- splice: 数组splice操作


使用前请阅读 [使用builder构建更新函数](https://github.com/ecomfe/san-update#使用builder构建更新函数) 文档进行详细了解。



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

`connect.san` 方法的签名为，`{function(Class)}connect.san({Object}mapStates, {Object?}mapActions)`

> 提示：san-store 只提供了对默认 store 实例的 connect 功能



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





