/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 全局默认 store 实例
 * @author errorrik
 */


import Store from './store';
import emitDevtool from './devtool/emitter';

/**
 * 全局默认 Store 实例
 * 通常，在一个应用应该具有一个全局唯一的 store，管理整个应用状态
 *
 * @type {Store}
 */
export default new Store({name: '__default__'});

// Alternatives for not receiving the events including default store info from
// connector.
emitDevtool('store-default-inited', {store});
