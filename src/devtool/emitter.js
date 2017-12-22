/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Devtool emitter entry
 * @author luyuan
 */

 import emitSanDevtool from './san-devtool';

 export default function emitDevtool() {
    emitSanDevtool.apply(null, arguments);
 }
