/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Devtool emitter
 * @author luyuan
 */

let isBrowser = typeof window !== 'undefined';

function emitDevtool(name, args) {
    if (isBrowser && window['__san_devtool__']) {
        window['__san_devtool__'].emit(name, args);
    }
}

export default emitDevtool;
