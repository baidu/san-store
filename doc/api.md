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

- `{Object?} options` 初始化参数
- `{Object?} options.initData` 容器的初始化数据
- `{Object?} options.actions` 容器的action函数集合
- `{boolean?} options.log` 是否记录日志


### getState

获取应用状态

**描述**

`{*} getState(name)`

- `{string} name` state名称
- `return` 应用状态的值


### addAction

添加一个 action

- `{string} name` action的名称
- `{Function} action` action函数


### dispatch

dispatch 一个 action

- `{string} name` action名称
- `{*} payload` 给予的数据

### listen

监听 store 数据变化

**描述**

`listen(listener)`

- `{function(change)} listener` 数据变化监听函数


### unlisten

移除 store 数据变化监听函数

**描述**

`unlisten(listener)`

- `{Function} listener` 数据变化监听函数

## connect

connect 用于将 store 实例与 san 组件连接，从而：

- 当 store 数据变更时，连接的组件数据也进行相应的变更
- 组件内部像调用方法一样 dispatch action，组件实现时无需关心对具体 store 的依赖

### connect.san

### connect.createConnector
