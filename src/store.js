/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file store class
 * @author errorrik
 */


import EventTarget from 'mini-event/EventTarget';
import parseName from './parse-name';
import {defineLazyProperty, visit} from './util/index';

/**
 * Store 类，应用程序状态数据的容器
 *
 * @class
 */
export default class Store extends EventTarget {

    /**
     * 构造函数
     *
     * @param {Object?} options 初始化参数
     * @param {Object?} options.initData 容器的初始化数据
     * @param {Object?} options.actions 容器的action函数集合
     */
    constructor(
        {
            initData = {},
            actions = {}
        } = {}
    ) {
        super();

        this.raw = initData;
        this.actions = actions;
        this.logs = [];
    }

    /**
     * 获取容器数据
     *
     * @param {string} name 数据项的名称
     * @return {*}
     */
    get(name) {
        name = parseName(name);

        let value = this.raw;
        for (let i = 0, l = name.length; value != null && i < l; i++) {
            value = value[name[i]];
        }

        return value;
    }

    /**
     * 添加一个 action
     *
     * @param {string | Symbol} name action的名称
     * @param {Function} action action函数
     */
    addAction(name, action) {
        if (typeof action !== 'function') {
            return;
        }

        if (this.actions[name]) {
            throw new Error('Action ' + name + ' exists!');
        }

        this.actions[name] = action;
    }

    /**
     * action 的 dispatch 入口
     *
     * @param {string | Symbol} name action名称
     * @param {*} payload payload
     */
    dispatch(name, payload) {
        let action = this.actions[name];

        if (typeof action === 'function') {
            this.log('Action start: ' + name);

            let macro = action(payload, this.raw);
            let update = macro.build();
            let records = macro.unpack()[1];
            let oldData = this.raw;
            let newData = update(oldData);
            this.raw = newData;

            for (let record of records) {
                let event = {
                    change: record.type,
                    value: record.value,
                    prop: record.path,
                    action: name
                };
                defineLazyProperty(event, 'oldValue', () => visit(oldData, record.path));
                defineLazyProperty(event, 'newValue', () => visit(newData, record.path));

                this.log(event);
                this.fire('change', event);
            }

            this.log('Action done: ' + name);
        }
    }

    /**
     * 记录日志
     *
     * @param {string|Object} info 日志信息，可能是字符串，也可能是一个操作信息对象
     */
    log(info) {
        this.logs.push(info);
    }
}

