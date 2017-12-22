/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 主模块
 * @author errorrik
 */

import Store from './store';
import createConnector from './connect/createConnector';
import emitDevtool from './devtool/emitter';

/**
 * 默认的全局 Store 实例
 * 通常我们认为在一个应用应该具有一个全局唯一的 store，管理整个应用状态
 *
 * @type {Store}
 */
export let store = new Store({name: '__default__'});

// Alternatives for not receiving the events including default store info from
// connector.
emitDevtool('store-default-inited', {store});

/**
 * 版本号
 *
 * @type {string}
 */
export let version = '1.1.0';

export {Store};

export let connect = {
    san: createConnector(store),
    createConnector
};
