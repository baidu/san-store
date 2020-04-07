
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
