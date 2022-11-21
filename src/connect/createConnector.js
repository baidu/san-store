/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san组件的connect
 * @author errorrik
 */

import parseName from '../parse-name';
import Store from '../store';
import emitDevtool from '../devtool/emitter';
import calcUpdateInfo from '../calc-update-info';

let extendsAsClass;

try {
    extendsAsClass = new Function('RawClass', 'return class extends RawClass {}');
}
catch (ex) {}

function extendsAsFunc(RawClass) {
    let F = new Function();
    F.prototype = RawClass.prototype;

    let NewClass = function (option) {
        return RawClass.call(this, option) || this;
    };

    NewClass.prototype = new F();
    NewClass.prototype.constructor = NewClass;

    if (F.prototype.hasOwnProperty('aPack')) {
        NewClass.prototype.aPack = F.prototype.aPack;
    }

    return NewClass;
}

function extendsComponent(ComponentClass) {
    let NewComponentClass;
    if (ComponentClass.toString().indexOf('class') === 0) {
        NewComponentClass = extendsAsClass(ComponentClass);
    }
    else {
        NewComponentClass = extendsAsFunc(ComponentClass);
    }

    NewComponentClass.template = ComponentClass.template;
    NewComponentClass.components = ComponentClass.components;
    NewComponentClass.trimWhitespace = ComponentClass.trimWhitespace;
    NewComponentClass.delimiters = ComponentClass.delimiters;
    NewComponentClass.autoFillStyleAndId = ComponentClass.autoFillStyleAndId;
    NewComponentClass.filters = ComponentClass.filters;
    NewComponentClass.computed = ComponentClass.computed;
    NewComponentClass.aPack = ComponentClass.aPack;
    NewComponentClass.messages = ComponentClass.messages;

    return NewComponentClass;
}

/**
 * san组件的connect
 *
 * @param {Object|Array} storeCollection store相关数据集合, 每一项{mapStates, mapActions, store}，含义如下:
 * {Object} mapStates 状态到组件数据的映射信息
 * {Object|Array?} mapActions store的action操作到组件actions方法的映射信息
 * {Store} store 指定的store实例
 * @return {function(ComponentClass)}
 */
export function connect(storeCollection) {
    if (!Array.isArray(storeCollection)) {
        storeCollection = [storeCollection];
    }

    for (let i = 0; i < storeCollection.length; i++) {
        const {mapStates, mapActions, store} = storeCollection[i];
        store.log && emitDevtool('store-connected', {
            mapStates,
            mapActions,
            store
        });
    }

    return function (ComponentClass) {
        let componentProto;
        let ReturnTarget;
        let extProto;

        if (typeof ComponentClass === 'function') {
            ReturnTarget = extendsComponent(ComponentClass);
            componentProto = ComponentClass.prototype;
            extProto = ReturnTarget.prototype;
        }
        else {
            componentProto = ComponentClass || {};
            ReturnTarget = Object.assign({}, ComponentClass);
            extProto = ReturnTarget;
        }

        let inited = componentProto.inited;
        let disposed = componentProto.disposed;

        extProto.inited = function () {
            this.__storeListeners = this.__storeListeners || [];

            for (let i = 0; i < storeCollection.length; i++) {
                const {mapStates, mapActions, store} = storeCollection[i];
                const mapStatesKey = Object.keys(mapStates);
                const mapStateInfo = [];
                // init data
                for (let i = 0; i < mapStatesKey.length; i++) {
                    const key = mapStatesKey[i];
                    const stateName = mapStates[key];
                    let stateInfo = {dataName: key};

                    if (typeof stateName === 'function') {
                        stateInfo.getter = stateName;
                        this.data.set(
                            stateInfo.dataName,
                            stateInfo.getter(store.getState(), this)
                        );
                    }
                    else if (typeof stateName === 'string') {
                        stateInfo.stateName = parseName(stateName);
                        this.data.set(stateInfo.dataName, store.getState(stateInfo.stateName));
                    }
                    mapStateInfo.push(stateInfo);
                }

                // listen store change
                let listener = diff => {
                    for (let i = 0; i < mapStateInfo.length; i++) {
                        let stateInfo = mapStateInfo[i];

                        if (typeof stateInfo.getter === 'function') {
                            this.data.set(
                                stateInfo.dataName,
                                stateInfo.getter(store.getState(), this)
                            );
                        }
                        else {
                            let updateInfo = calcUpdateInfo(stateInfo, diff);
                            if (updateInfo) {
                                if (updateInfo.spliceArgs) {
                                    this.data.splice(updateInfo.componentData, updateInfo.spliceArgs);
                                }
                                else {
                                    this.data.set(updateInfo.componentData, store.getState(updateInfo.storeData));
                                }
                            }
                        }
                    }
                };

                store.listen(listener);
                this.__storeListeners.push(listener);

                store.log && emitDevtool('store-comp-inited', {
                    mapStates,
                    mapActions,
                    store,
                    component: this,
                });
            }

            if (typeof inited === 'function') {
                inited.call(this);
            }
        };

        extProto.disposed = function () {
            for (let i = 0; i < storeCollection.length; i++) {
                const {mapStates, mapActions, store} = storeCollection[i];
                store.unlisten(this.__storeListeners[i]);

                store.log && emitDevtool('store-comp-disposed', {
                    mapStates,
                    mapActions,
                    store,
                    component: this,
                });
            }

            this.__storeListeners = null;

            if (typeof disposed === 'function') {
                disposed.call(this);
            }
        };

        // map actions
        if (!extProto.actions) {
            extProto.actions = {};

            for (let i = 0; i < storeCollection.length; i++) {
                const {mapActions, store} = storeCollection[i];
                const actions = mapActions instanceof Array
                    ? mapActions
                    : Object.keys(mapActions);

                for (let i = 0; i < actions.length; i++) {
                    const actionName = actions[i];
                    extProto.actions[actionName] = function (payload) {
                        return store.dispatch(actionName, payload);
                    };
                }
            }
        }

        return ReturnTarget;
    };
}

/**
 * createConnector 创建连接
 *
 * @param {Store} store store实例
 * @return {Function}
 */
export default function createConnector(defaultStore) {
    if (defaultStore instanceof Store) {
        return (mapStates, mapActions, store = defaultStore) => connect({mapStates, mapActions, store});
    }

    throw new Error(defaultStore + ' must be an instance of Store!');
}
