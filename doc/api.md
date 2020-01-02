# san-store API

## store

默认的 Store 的实例，在 san-store 装载时创建，并提供了默认的connect方法: connect.san。 

**示例**

```javascript
import {store} from 'san-store';

store.getState('user');
```

## Store

应用程序状态数据的容器类。 

**示例**

```javascript
import {Store} from 'san-store';

const myStore = new Store();
```

### 初始化

通过构造函数初始化 Store 实例。

**描述**

`constructor(options)`

**参数**

- `{Object?} options` 初始化参数
- `{Object?} options.initData` 容器的初始化数据
- `{Object?} options.actions` 容器的action函数集合
- `{boolean?} options.log` 是否记录日志

**示例**

```javascript
import {Store} from 'san-store';
import {builder} from 'san-update';


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
});
```

### getState

获取应用状态

**描述**

`{*} getState(name)`

**参数**

- `{string} name` state名称

**返回**

`{*}`，应用状态的值

**示例**

```javascript
myStore.getState('user.name');
```

### addAction

添加一个 action

**描述**

`addAction(name, action)`

**参数**

- `{string} name` action的名称
- `{function (payload, {getState, dispatch})} action` action函数

**返回**

无

### dispatch

dispatch 一个 action

**描述**

`{void|Promise} dispatch(name, payload)`

**参数**

- `{string} name` action名称
- `{*} payload` 给予的数据

**返回**

`{void|Promise}`

- action 为同步时，返回 undefined
- action 为异步时，返回 Promise

### listen

监听 store 数据变化

**描述**

`listen(listener)`

**参数**

- `{function(change)} listener` 数据变化监听函数

**返回**

无

### unlisten

移除 store 数据变化监听函数

**描述**

`unlisten(listener)`

**参数**

- `{Function} listener` 数据变化监听函数

**返回**

无

## connect

connect 用于将 store 实例与 san 组件连接，从而：

- 当 store 数据变更时，连接的组件数据也进行相应的变更
- 组件内部像调用方法一样 dispatch action，组件实现时无需关心对具体 store 的依赖

### connect.san

默认 connector，对 san-store 装载时创建的默认 Store 的实例，进行 connect 操作。通常，connect 操作需要进行 2 次调用：

1. 指定 mapStates 和 mapActions
2. 对相应的组件类进行 connect

**描述**

`{Function}connect.san(mapStates, mapActions)`

**参数**

- `{Object} mapStates` 状态到组件数据的映射信息
- `{Object|Array?} mapActions` store的action操作到组件actions方法的映射信息

**返回**

`{ComponentClass}function({ComponentClass}Component)`

connect.san 返回一个执行 connect 操作的函数，这个函数可以接受一个组件类作为参数，返回一个新的经过 connect 操作的组件类

### connect.createConnector

创建 connector。connector 是一个函数，可以通过 2 次调用，对预先指定的 store 执行 connect 操作。调用方式参考上一章节 `connect.san`。

**描述**

`{Function}connect.createConnector(store)`

**参数**

- `{Store} store` connector对应的store实例

**返回**

`{Function}function(mapStates, mapActions)`

