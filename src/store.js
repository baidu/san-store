/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file store class
 * @author errorrik
 */


import flattenDiff from './flatten-diff';
import parseName from './parse-name';
import emitDevtool from './devtool/emitter';

/**
 * 唯一id的起始值
 *
 * @inner
 * @type {number}
 */
let guidIndex = 0;

/**
 * 获取唯一id
 *
 * @inner
 * @return {string} 唯一id
 */
let guid = () => (++guidIndex).toString();


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
     * @param {boolean?} options.log 是否记录日志
     */
    constructor(
        {
            initData = {},
            actions = {},
            log = false,
            name
        } = {}
    ) {
        this.raw = initData;
        this.actions = actions;
        this.log = log;
        this.name = name;
        this.id = guid();

        this.listeners = [];

        this.stateChangeLogs = [];
        this.actionInfos = [];
        this.actionInfoIndex = {};
        this.aiLen = 0;

        this.stateGetter = name => this.getState(name);
    }

    /**
     * 获取 state
     *
     * @param {string} name state名称
     * @return {*}
     */
    getState(name) {
        name = parseName(name);

        let value = this.raw;
        for (let i = 0, l = name.length; value != null && i < l; i++) {
            value = value[name[i]];
        }

        return value;
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
        // Alternatives for not receiving the events including default store
        // info from connector.
        this.log && emitDevtool('store-listened', {
            store: this,
            listener
        });
    }

    /**
     * 移除 store 数据变化监听器
     *
     * @param {Function} listener 监听器函数
     */
    unlisten(listener) {
        let len = this.listeners.length;
        while (len--) {
            if (this.listeners[len] === listener) {
                this.listeners.splice(len, 1);
            }
        }
        // Alternatives for not receiving the events including default store
        // info from connector.
        this.log && emitDevtool('store-unlistened', {
            store: this,
            listener
        });
    }

    /**
     * 触发 store 数据变化
     *
     * @private
     * @param {Array} diff 数据变更信息对象
     */
    _fire(diff) {
        for (let i = 0, l = this.listeners.length; i < l; i++) {
            this.listeners[i].call(this, diff);
        }
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

        this.log && emitDevtool('store-action-added', {store: this, action});
    }

    /**
     * action 的 dispatch 入口
     *
     * @param {string} name action名称
     * @param {*} payload payload
     */
    dispatch(name, payload) {
        return this._dispatch(name, payload);
    }

    /**
     * action 的 dispatch 入口
     *
     * @private
     * @param {string} name action名称
     * @param {*} payload payload
     * @param {string} parentId 所属父action的id
     */
    _dispatch(name, payload, parentId) {
        let action = this.actions[name];
        let actionId = guid();

        if (typeof action !== 'function') {
            return;
        }

        let actionReturn = this._actionStart(actionId, name, action, payload, parentId);


        let diff;
        if (actionReturn) {
            if (typeof actionReturn.then === 'function') {
                return actionReturn.then(returns => {
                    this._actionDone(actionId);
                    return returns;
                });
            }

            let oldValue = this.raw;
            this.raw = actionReturn[0];
            diff = actionReturn[1];

            if (this.log) {
                this.stateChangeLogs.push({
                    oldValue,
                    newValue: this.raw,
                    diff,
                    id: actionId
                });
            }
        }

        this._actionDone(actionId);

        if (diff && diff.length > 0) {
            this._fire(diff);
        }
    }

    _getActionInfo(id) {
        let index = this.actionInfoIndex[id];

        if (index != null) {
            return this.actionInfos[index];
        }
    }

    /**
     * 开始运行 action
     *
     * @param {string} id action的id
     * @param {string} name action 名称
     * @param {Function} action action 函数
     * @param {*} payload payload
     * @param {string?} parentId 父action的id
     */
    _actionStart(id, name, action, payload, parentId) {
        let actionInfo = {
            id,
            name,
            parentId,
            childs: []
        };

        if (this.log) {
            actionInfo.startTime = (new Date()).getTime();
            actionInfo.payload = payload;
        }

        this.actionInfos[this.aiLen] = actionInfo;
        this.actionInfoIndex[id] = this.aiLen++;

        if (parentId) {
            let parentActionInfo = this._getActionInfo(parentId);
            parentActionInfo && parentActionInfo.childs.push(id);
        }

        this.log && emitDevtool('store-dispatch', {
            store: this,
            name,
            payload,
            actionId: id,
            parentId
        });

        let returnValue = action.call(this, payload, {
            getState: this.stateGetter,
            dispatch: (name, payload) => this._dispatch(name, payload, id)
        });

        if (returnValue != null) {
            if (typeof returnValue.buildWithDiff === 'function') {
                let updateInfo = returnValue.buildWithDiff()(this.raw);
                updateInfo[1] = flattenDiff(updateInfo[1]);

                if (this.log) {
                    actionInfo.updateInfo = updateInfo;
                }

                return updateInfo;
            }

            if (typeof returnValue.then === 'function') {
                return returnValue;
            }
        }
    }

    /**
     * action 运行完成
     *
     * @param {string} id action的id
     * @param {Function?} updateBuilder 状态更新函数生成器
     */
    _actionDone(id) {
        this._getActionInfo(id).selfDone = true;
        this._detectActionDone(id);
    }

    /**
     * 探测 action 是否完全运行完成，只有子 action 都运行完成才算运行完成
     *
     * @param {string} id action的id
     */
    _detectActionDone(id) {
        if (!id) {
            return;
        }

        let actionInfo = this._getActionInfo(id);
        if (!actionInfo) {
            return;
        }

        if (!actionInfo.selfDone) {
            return false;
        }

        for (let i = 0; i < actionInfo.childs.length; i++) {
            if (!this._getActionInfo(actionInfo.childs[i]).done) {
                return false;
            }
        }

        actionInfo.done = true;

        if (this.log) {
            actionInfo.endTime = (new Date()).getTime();
            emitDevtool('store-dispatched', {
                store: this,
                diff: actionInfo.updateInfo ? actionInfo.updateInfo[1] : null,
                name: actionInfo.name,
                payload: actionInfo.payload,
                actionId: actionInfo.id,
                parentId: actionInfo.parentId
            });
        }

        // free actionInfos
        if (this._detectActionDone(actionInfo.parentId) == null && !this.log) {
            if (this.actionInfos.some(actionInfo => !actionInfo.done)) {
                return;
            }
            let len = this.actionInfos.length;
            while (len--) {
                const deleteId =  this.actionInfos[len].id;
                delete this.actionInfoIndex[deleteId];
            }

            this.actionInfos = [];
            this.aiLen = 0;
        }

        return true;
    }
}
