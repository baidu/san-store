/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 主模块
 * @author errorrik
 */

import Store from './store';
import store from './default-store';
import connect from './connect';


/**
 * 版本号
 *
 * @type {string}
 */
export const version = '__VERSION__';

export {Store, store, connect};


