# san-store API

- [store](#store)
- [Store](#store-1)
    - [初始化](#初始化)
    - [getState](#getstate)
    - [addAction](#addaction)
    - [dispatch](#dispatch)
    - [listen](#listen)
    - [unlisten](#unlisten)
- [connect](#connect)
    - [connect()](#connect-1) 2.2+
    - [connect.san](#connectsan) Deprecated
    - [connect.createConnector](#connectcreateconnector) Deprecated
- [use](#use) 2.2+
    - [useState](#usestate) 2.2+
    - [useAction](#useaction) 2.2+

## store

默认的 Store 的实例，在 san-store 装载时创建。connect 方法也将默认 connect 到该实例。

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

添加一个 Action。它是一个函数:

- 接受 dispatch 时的 payload，包含 getState 和 dispatch 方法的 context 对象
- 执行相应的动作，整个过程可以是同步或异步
- 返回 [san-update](https://github.com/baidu/san-update) 的 builder 对象时，同步变更 store 状态
- 返回 Promise 对象时，为异步过程。过程中可以 dispatch 任何同步的 action，对 store 进行状态变更

Action 签名如下：

```
{builder?} function ({*}payload, {{Function}getState, {Function}dispatch})
```

**描述**

`addAction(name, action)`

**参数**

- `{string} name` action的名称
- `{function (payload, {getState, dispatch})} action` action函数

**返回**

无

**示例**

```javascript
import {store} from 'san-store';
import {builder} from 'san-update';

// 同步 Action
store.addAction('setUserName', function (name) {
    return builder().set('user.name', name);
});

store.addAction('logining', function (logining) {
    return builder().set('logining', logining);
});

// 异步 Action
store.addAction('login', function (payload, {getState, dispatch}) {
    if (getState('user.name') === payload.name) {
        return;
    }

    dispatch('logining', true);
    return userService.validate(payload).then(() => {
        dispatch('setUserName', payload.name);
        dispatch('logining', false);
    })
});
```

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

**示例**

```javascript
store.dispatch('login', {
    name: 'errorrik',
    password: 'xxxxx'
});
```

### listen

监听 store 数据变化

**描述**

`listen(listener)`

**参数**

- `{function(changes)} listener` 数据变化监听函数

listener 接收的 changes 参数是一个数据变更数组，因为一次 san-update 的 builder 可能包含多个状态数据变更操作。每个 change 对象可能包含如下属性：

```
{
    $change: {string},
    target: {Array<string>},
    oldValue: {*},
    newValue: {*},
    splice: {
        index: {number},
        deleteCount: {number},
        insertions: {Array}
    }
}
```

**返回**

无

**示例**

```javascript
function storeListener(changes) {
    changes.forEach(change => {
        // read change and do sth
        console.log(change);
    });
}

store.listen(storeListener);
```

### unlisten

移除 store 数据变化监听函数

**描述**

`unlisten(listener)`

**参数**

- `{Function} listener` 数据变化监听函数

**返回**

无

**示例**

```javascript
store.unlisten(storeListener);
```

## connect

connect 用于将 store 实例与 san 组件连接，从而：

- 当 store 数据变更时，连接的组件数据也进行相应的变更
- 组件内部像调用方法一样 dispatch action，组件实现时无需关心对具体 store 的依赖

### connect()

**>= 2.2.0**

connect 可实现链式调用，实现一个组件连接多个 store 的操作。

**描述**

`{Function}connect(store, mapStates, mapActions)`

**参数**

- `{Store?} store` connector对应的store实例
- `{Object} mapStates` 状态到组件数据的映射信息
- `{Object|Array?} mapActions` store的action操作到组件actions方法的映射信息

**返回**

`{ComponentClass}function({ComponentClass}Component)`

connect 操作函数。

- 这个函数可以接受一个组件类作为参数，返回一个新的经过 connect 操作的组件类
- 可以继续链式调用该函数的 connect 方法，连接一个新的 store，返回一个新的 connect 操作函数

**示例**

```javascript
// connect 默认 store
import {connect} from 'san-store';
let UserNameEditor = connect(
    {name: 'user.name'},
    {change: 'changeUserName'}
)(san.defineComponent({
    template: `
        <div>{{name}}
            <input value="{=newName=}"><button on-click="change">change</button>
            <ul>
                <li s-for="item in todo">{{item}}</li>
            </ul>
        </div>
    `,

    change() {
        this.actions.change(this.data.get('newName'));
    }
}));
```

```javascript
// connect 自多个 store
import {store, connect} from 'san-store';
import userStore from '../store/user';
import todoStore from '../store/todo';
let UserNameEditor = connect(
    userStore,
    {name: 'user.name'},
    {change: 'changeUserName'}
).connect(
    todoStore,
    {todo: 'todos'},
    {changeTodos: 'changeTodos'}
)(san.defineComponent({
    template: `
        <div>{{name}}
            <input value="{=newName=}"><button on-click="change">change</button>
            <ul>
                <li s-for="item in todo">{{item}}</li>
            </ul>
        </div>
    `,

    change() {
        this.actions.change(this.data.get('newName'));
    }
}));
```

### connect.san

**2.2.0后标记废弃。请直接使用 connect([store, ]mapStates[, mapActions])**

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

**示例**

```javascript
import {store, connect} from 'san-store';

let UserNameEditor = connect.san(
    {name: 'user.name'},
    {change: 'changeUserName'}
)(san.defineComponent({
    template: `
        <div>{{name}}
            <input value="{=newName=}"><button on-click="change">change</button>
        </div>
    `,

    change() {
        this.actions.change(this.data.get('newName'));
    }
}));
```

### connect.createConnector

**2.2.0后标记废弃。请直接使用 connect([store, ]mapStates[, mapActions])**

创建 connector。connector 是一个函数，可以通过 2 次调用，对预先指定的 store 执行 connect 操作。调用方式参考上一章节 `connect.san`。

**描述**

`{Function}connect.createConnector(store)`

**参数**

- `{Store} store` connector对应的store实例

**返回**

`{Function}function(mapStates, mapActions)`

**示例**

```javascript
import {Store, connect} from 'san-store';

// 创建store实例
const myStore = new Store({
    initData: {
        name:'erik'
    },
    actions:{
        changeUserName(name) {
            return builder().set('user.name', name);
        }
    }
});

// 调用connect.createConnector方法，传入store实例
const connectMyStore = connect.createConnector(myStore);

// 调用手动创建的connectMyStore方法，进行myStore和组件连接
let UserNameEditor = connectMyStore(
    {name: 'user.name'},
    {change: 'changeUserName'}
)(san.defineComponent({
    template: `
        <div>{{name}}
            <input value="{=newName=}"><button on-click="change">change</button>
        </div>
    `,

    change() {
        this.actions.change(this.data.get('newName'));
    }
}));
```


## use

use 模块提供了 `useState` 和 `useAction` 方法，用于在 [componsition](https://github.com/baidu/san-composition) 形态的组件中使用 store。

use 模块是独立模块，需要独立 import。

```js
import {useState} from 'san-store/use';
```


### useState

**>= 2.2.0**

将 store 内的一个 state 绑定到当前组件，并返回数据的引用，当 store 内数据更新时，当前组件内对应数据项即更新。

**描述**

`{DataProxy}useState(store, stateName, dataName?)`

**参数**


- `{Store} store` store 实例
- `{string} stateName` store内的 state name
- `{string?} dataName` 组件的 data name

**返回**

`{DataProxy}`

返回绑定至组件内的数据代理


**示例**

```javascript
import san from 'san';
import {defineComponent, template, onAttached} from 'san-composition';
import {useState} from 'san-store/use';
import {Store} from 'san-store';

// 创建store实例
const myStore = new Store({
    initData: {
        name:'erik'
    },
    actions:{
        changeUserName(name) {
            return builder().set('user.name', name);
        }
    }
});


export default defineComponent(() => {
    template(`
        <div>{{name}}</div>
    `);
    const name = useState(myStore, 'user.name', 'name');

    onAttached(() => {
        console.log(name.get())
    });

}, san);

```

### useAction

**>= 2.2.0**

在当前组件内定义派发 store 内对应 action 的方法, 并返回该方法的引用。

**描述**

`{Function}useAction(store, actionName, methodName?)`

**参数**

- `{Store} store` store 实例
- `{string} stateName` store 内的 action name
- `{string?} dataName` 组件的 method name


**返回**

`Function`

可被调用的 dispatch 函数。


**示例**

```javascript
import san from 'san';
import {defineComponent, template, method} from 'san-composition';
import {useState, useAction} from 'san-store/use';
import {Store} from 'san-store';

// 创建store实例
const myStore = new Store({
    initData: {
        name:'erik'
    },
    actions:{
        changeUserName(name) {
            return builder().set('user.name', name);
        }
    }
});


export default defineComponent(context => {
    template(`
        <div>{{name}}
            <input value="{=newName=}"><button on-click="change">change</button>
        </div>
    `);
    const name = useState(myStore, 'user.name', 'name');
    let changeUserName = useAction(myStore, 'changeUserName');

    method({
        change: () => {
            changeUserName(context.data.get('newName'));
        }
    });

}, san);

```

