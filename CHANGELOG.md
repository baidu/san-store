2.1.2
---------

- [修复] template 被编译成 aPack 的组件，被 connect 后可能渲染失败


2.1.1
---------

- [修复] action 完成后，使用 action 内部的 dispatch 方法，会导致运行时错误。该问题为 2.1.0 引入


2.1.0
---------

- [变更] store 的 log 配置，默认值由 true 更改为 false
- [优化] action dispatch 后增加对象清除逻辑，优化内存占用


2.0.3
---------

- [优化] 优化 action 流转的效率
- [新特性] 增加 store-dispatch 的 emitDevtool 点，以便于开发工具对 action dispatch 过程的跟踪


2.0.2
---------

- [优化] connect 支持 ES class 继承的组件经过 babel transform 后的类形态


2.0.1
---------

connect 返回派生类，不在原组件类上注入行为，产生了一些额外问题。此版本进行了一些优化

- [优化] 支持对 ES class 继承的组件进行 connect
- [优化] connect 时，复制组件的 static 成员，否则组件信息会丢失


2.0.0
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
