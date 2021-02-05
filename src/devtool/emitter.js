/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Devtool emitter entry
 * @author luyuan
 */

let isBrowser = typeof window !== 'undefined';

const hasSanDevtool = !!(isBrowser && window['__san_devtool__']);

export {hasSanDevtool};

export default function emitDevtool(name, args) {
   if (hasSanDevtool) {
       window['__san_devtool__'].emit(name, args);
   }
}
