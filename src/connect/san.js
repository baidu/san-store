/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san组件的connect
 * @author errorrik
 */


import parseName from '../parse-name';
import {store} from '../main';


/**
 * san组件的connect
 *
 * @param {Object} mapStates 状态到组件数据的映射信息
 * @param {Object|Array?} mapActions store的action操作到组件actions方法的映射信息
 * @return {function(ComponentClass)}
 */
export default function connect(mapStates, mapActions) {
    let mapStateInfo = [];

    for (let key in mapStates) {
        if (mapStates.hasOwnProperty(key)) {
            let mapState = mapStates[key];
            let mapInfo = {dataName: key};

            switch (typeof mapState) {
                case 'string':
                    mapInfo.stateName = parseName(mapState);
                    break;

                case 'function':
                    mapInfo.getter = mapState;
                    break;

                default:
                    mapInfo = null;
                    break;
            }

            mapInfo && mapStateInfo.push(mapInfo);
        }
    }

    return function (ComponentClass) {
        // map states
        let inited = ComponentClass.prototype.inited;
        ComponentClass.prototype.inited = function () {
            // init data
            mapStateInfo.forEach(info => {
                this.data.set(info.dataName, getStateValue(info));
            });

            // listen store change
            this.storeListener = diff => {
                mapStateInfo.forEach(info => {
                    if (stateNeedUpdate(info, diff)) {
                        this.data.set(info.dataName, getStateValue(info));
                    }
                });
            };
            store.listen(this.storeListener);

            if (typeof inited === 'function') {
                inited.call(this);
            }
        };

        let disposed = ComponentClass.prototype.disposed;
        ComponentClass.prototype.disposed = function () {
            store.unlisten(this.storeListener);
            this.storeListener = null;

            if (typeof disposed === 'function') {
                disposed.call(this);
            }
        };

        // map actions
        if (!ComponentClass.prototype.actions) {
            ComponentClass.prototype.actions = {};

            if (mapActions instanceof Array) {
                mapActions.forEach(actionName => {
                    ComponentClass.prototype.actions[actionName] = function (payload) {
                        store.dispatch(actionName, payload);
                    };
                });
            }
            else {
                for (let key in mapActions) {
                    let actionName = mapActions[key];
                    ComponentClass.prototype.actions[key] = function (payload) {
                        store.dispatch(actionName, payload);
                    };
                }
            }
        }

        return ComponentClass;
    };
}

/**
 * 判断 connect 的 state 值
 *
 * @param {Object} info state的connect信息对象
 * @return {*}
 */
function getStateValue(info) {
    let states = store.get();

    if (typeof info.getter === 'function') {
        return info.getter(states);
    }
    else if (info.stateName) {
        let value = states;
        for (let i = 0; value && i < info.stateName.length; i++) {
            if (typeof value === 'object' && value != null) {
                value = value[info.stateName[i]];
            }
            else {
                return null;
            }
        }

        return value;
    }

    return null;
}

/**
 * 判断 connect 的 state 是否需要更新
 *
 * @param {Object} info state的connect信息对象
 * @param {Array} diff 数据变更的diff信息
 * @return {boolean}
 */
function stateNeedUpdate(info, diff){
    if (typeof info.getter === 'function') {
        return true;
    }
    else if (info.stateName) {
        let result = false;
        let stateNameLen = info.stateName.length;

        for (let i = 0, diffLen = diff.length; i < diffLen; i++) {
            let target = diff[i].target;
            let matchThisDiff = true;

            for (let j = 0, targetLen = target.length; j < targetLen && j < stateNameLen; j++) {
                if (info.stateName[j] != target[j]) {
                    matchThisDiff = false;
                    break;
                }
            }

            if (matchThisDiff) {
                return matchThisDiff;
            }
        }
    }
}
