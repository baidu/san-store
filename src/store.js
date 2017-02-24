/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file store class
 * @author errorrik
 */


import EventTarget from 'mini-event/EventTarget';
import {set, push, unshift, splice} from 'san-update';
import parseName from './parse-name';

/**
 * action 运行环境类，其实例对象作为 action 运行时的 this
 *
 * @class
 */
class ActionContext {
    /**
     * 构造函数
     *
     * @param {Store} store 所属数据容器对象
     * @param {string} name action的名称
     */
    constructor(store, name) {
        this.store = store;
        this.name = name;
    }

    /**
     * dispatch 一个 action
     *
     * @param {string} name action名称
     * @param {*} payload payload
     */
    dispatch(name, payload) {
        this.store.dispatch(name, payload);
    }

    /**
     * 在数据容器对象设置中设值
     *
     * @param {string} name 数据项的名称
     * @param {*} value 数据项的值
     */
    set(name, value) {
        let prop = parseName(name);

        if (value !== this.store.get(prop)) {
            this.store.raw = set(this.store.raw, prop, value);

            let arg = {
                change: 'set',
                action: this.name,
                value: value,
                prop: prop
            };
            this.store.log(arg);
            this.store.fire('change', arg);
        }
    }

    /**
     * 为数组的数据项 push 一条数据
     *
     * @param {string} name 数据项的名称
     * @param {*} value 要push的数据
     */
    push(name, value) {
        if (value != null) {
            let prop = parseName(name);

            this.store.raw = push(this.store.raw, prop, value);
            let arg = {
                change: 'push',
                action: this.name,
                value: value,
                prop: prop
            };

            this.store.log(arg);
            this.store.fire('change', arg);
        }
    }

    /**
     * 为数组的数据项 unshift 一条数据
     *
     * @param {string} name 数据项的名称
     * @param {*} value 要unshift的数据
     */
    unshift(name, value) {
        if (value != null) {
            let prop = parseName(name);

            this.store.raw = unshift(this.store.raw, prop, value);
            let arg = {
                change: 'unshift',
                action: this.name,
                value: value,
                prop: prop
            };

            this.store.log(arg);
            this.store.fire('change', arg);
        }
    }

    /**
     * 数组数据项的 pop 操作
     *
     * @param {string} name 数据项的名称
     * @return {*}
     */
    pop(name) {
        let prop = parseName(name);

        let array = this.store.get(prop);
        let arrayLen;
        if (array instanceof Array && (arrayLen = array.length) > 0) {
            let value = array[arrayLen - 1];

            this.store.raw = splice(this.store.raw, prop, arrayLen - 1, 1);
            let arg = {
                change: 'pop',
                action: this.name,
                value: value,
                prop: prop
            };

            this.store.log(arg);
            this.store.fire('change', arg);

            return value;
        }
    }

    /**
     * 数组数据项的 shift 操作
     *
     * @param {string} name 数据项的名称
     * @return {*}
     */
    shift(name) {
        let prop = parseName(name);

        let array = this.store.get(prop);
        if (array instanceof Array && array.length > 0) {
            let value = array[0];

            this.store.raw = splice(this.store.raw, prop, 0, 1);
            let arg = {
                change: 'shift',
                action: this.name,
                value: value,
                prop: prop
            };

            this.store.log(arg);
            this.store.fire('change', arg);

            return value;
        }
    }

    /**
     * 根据 index 移除数组数据项的 item
     *
     * @param {string} name 数据项的名称
     * @param {number} index 要移除项的index
     */
    removeAt(name, index) {
        let prop = parseName(name);

        let array = this.store.get(prop);
        if (array instanceof Array && array.length > index) {
            let value = array[index];

            this.store.raw = splice(this.store.raw, prop, index, 1);
            let arg = {
                change: 'remove',
                action: this.name,
                value: value,
                prop: prop,
                index: index
            };

            this.store.log(arg);
            this.store.fire('change', arg);

            return value;
        }
    }

    /**
     * 移除数组数据项中的 item
     *
     * @param {string} name 数据项的名称
     * @param {*} value 要移除的项
     */
    remove(name, value) {
        let prop = parseName(name);

        let array = this.store.get(prop);
        if (array instanceof Array) {
            let len = array.length;

            while (len--) {
                if (array[len] === value) {
                    return this.removeAt(prop, len);
                }
            }
        }
    }
}

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
     * @param {string} name action的名称
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
     * 添加多个 action
     *
     * @param {Object} actions action集合对象。对象的key是action的name，value是action函数
     */
    addActions(actions) {
        for (let key in actions) {
            if (actions.hasOwnProperty(key)) {
                this.addAction(key, actions[key]);
            }
        }
    }

    /**
     * action 的 dispatch 入口
     *
     * @param {string} name action名称
     * @param {*} payload payload
     */
    dispatch(name, payload) {
        let action = this.actions[name];

        if (typeof action === 'function') {
            this.log('Action start: ' + name);

            let context = new ActionContext(store, name);
            action.call(context, payload);

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

