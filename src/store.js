/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file store class
 * @author errorrik
 */


import flattenDiff from './flatten-diff';
import parseName from './parse-name';

const GUID_CHARS = 'qwertyuiopasdfghjklzxcvbnm'.split();

function randomChars() {
    let chars = '';

    for (let i = 0; i < 3; i++) {
        chars += GUID_CHARS[Math.floor(Math.random()*25)];
    }

    return chars;
}

function guid() {
    return (new Date()).getTime() + randomChars();
}

/**
 * Store 类，应用程序状态数据的容器
 *
 * @class
 */
export default class Store {
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
        this.raw = initData;
        this.actions = actions;
        this.logs = [];
        this.listeners = [];
    }

    /**
     * 获取容器数据
     *
     * @return {Object}
     */
    get(name) {
        return this.raw;
    }

    /**
     * 监听 store 数据变化
     *
     * @param {Function} listener 监听器函数，接收diff对象
     */
    listen(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    /**
     * 移除 store 数据变化监听器
     *
     * @param {Function} listener 监听器函数
     */
    unlisten(listener) {
        let len = this.listeners.length;
        while (len--) {
            if (this.listeners[len] === listener){
                this.listeners.splice(len, 1);
            }
        }
    }

    /**
     * 触发 store 数据变化
     *
     * @private
     * @param {Array} diff 数据变更信息对象
     */
    _fire(diff) {
        this.listeners.forEach(listener => {
            listener.call(this, diff);
        });
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
        let actionId = guid();

        if (typeof action === 'function') {
            this.log({
                id: actionId,
                name: name,
                message: 'Action Start'
            });

            let macro = action.call(this, payload);

            if (macro && typeof macro.buildWithDiff === 'function') {
                let oldRaw = this.raw;
                let [data, diff] = macro.buildWithDiff()(oldRaw);

                diff = flattenDiff(diff)
                this.raw = data;

                this.log({
                    id: actionId,
                    name: name,
                    message: 'Store Update',
                    old: oldRaw,
                    diff: diff
                });

                this._fire(diff);
            }

            this.log({
                id: actionId,
                name: name,
                message: 'Action Done'
            });
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


