2.2.6 (2023-6-26)
---------

- [修复] 父 action 完成后，子 action 开始执行，获取到错误的父 action 信息，导致 JS 循环致栈溢出


2.2.5 (2023-4-19)
---------

- [修复] 通过 state getter 函数使用 useState 时，状态变更可能导致 JS 运行错误


2.2.4 (2023-4-12)
---------

- [修复] 修改父对象的值，connect 到子属性的组件数据可能不会更新。该 bug 为 2.2.3 引入


2.2.3 (2023-4-6)
---------

- [修复] 修改 state 的值，可能引起 connect 到同级其他 state 的组件数据错误更新。该 bug 为 2.2.2 引入



2.2.2 (2023-4-5)
---------

- [修复] 使用 san-update 的 merge 方法修改多数据项或多次 set 修改同一个数组时，connect 的组件数据更新丢失


2.2.1 (2022-12-29)
---------

- [修复] use 模块引用失败


2.2.0 (2022-12-28)
---------

- [新特性] 新的组件连接函数 connect([store, ]mapStates[, mapActions])
- [新特性] 新增 composition api 支持
- [新特性] 新增 typescript 类型支持
- [废弃] connect.san 废弃，使用 connect([store, ]mapStates[, mapActions]) 替代
- [废弃] connect.createConnector 废弃，使用 connect([store, ]mapStates[, mapActions]) 替代


2.1.3 (2021-9-13)
---------

- [新特性] connect 的 mapStates 项为 function 时，增加组件实例对象的传入。该特性支持根据组件实例决定 connect 的 state 项。


2.1.2 (2021-5-20)
---------

- [修复] template 被编译成 aPack 的组件，被 connect 后可能渲染失败


2.1.1 (2021-3-12)
---------

- [修复] action 完成后，使用 action 内部的 dispatch 方法，会导致运行时错误。该问题为 2.1.0 引入


2.1.0 (2021-1-30)
---------

- [变更] store 的 log 配置，默认值由 true 更改为 false
- [优化] action dispatch 后增加对象清除逻辑，优化内存占用


2.0.3 (2020-8-28)
---------

- [优化] 优化 action 流转的效率
- [新特性] 增加 store-dispatch 的 emitDevtool 点，以便于开发工具对 action dispatch 过程的跟踪


2.0.2 (2020-4-9)
---------

- [优化] connect 支持 ES class 继承的组件经过 babel transform 后的类形态


2.0.1 (2020-4-8)
---------

connect 返回派生类，不在原组件类上注入行为，产生了一些额外问题。此版本进行了一些优化

- [优化] 支持对 ES class 继承的组件进行 connect
- [优化] connect 时，复制组件的 static 成员，否则组件信息会丢失


2.0.0 (2020-1-2)
---------

- [变更] connect 返回组件的派生类，不在当前组件进行 connect


1.1.3
---------

- [新特性] dispatch 为异步过程时，返回 Promise 的 resolve 值向下传递


1.1.2
---------

- [修复] connect 的异步 action，无返回 Promise


1.1.1
---------

- [新特性] dispatch 为异步过程时，返回 Promise


1.0.1
---------

啥都没干，仅仅为了 publish 有 README 的 npm package。作者机器上的 npm 版本老，有 bug。
