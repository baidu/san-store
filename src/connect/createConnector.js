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

let extendsAsClass;

try {
    extendsAsClass = new Function('RawClass', "return class extends RawClass {}");
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
 * @param {Object} mapStates 状态到组件数据的映射信息
 * @param {Object|Array?} mapActions store的action操作到组件actions方法的映射信息
 * @param {Store} store 指定的store实例
 * @return {function(ComponentClass)}
 */
function connect(mapStates, mapActions, store) {
    let mapStateInfo = [];
    let mapStateCount = 0;

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

            if (mapInfo) {
                mapStateInfo.push(mapInfo);
                mapStateCount++;
            }
        }
    }

    store.log && emitDevtool('store-connected', {
        mapStates,
        mapActions,
        store
    });

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
            // init data
            for (let i = 0; i < mapStateCount; i++) {
                let stateInfo = mapStateInfo[i];

                if (typeof stateInfo.getter === 'function') {
                    this.data.set(
                        stateInfo.dataName,
                        stateInfo.getter(store.getState(), this)
                    );
                }
                else {
                    this.data.set(stateInfo.dataName, store.getState(stateInfo.stateName));
                }
            }

            // listen store change
            this.__storeListener = diff => {
                for (let i = 0; i < mapStateCount; i++) {
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
            store.listen(this.__storeListener);

            store.log && emitDevtool('store-comp-inited', {
                mapStates,
                mapActions,
                store,
                component: this,
            });

            if (typeof inited === 'function') {
                inited.call(this);
            }

            // map actions
            if (!extProto.actions) {
                const _this = this;
                extProto.actions = {};

                if (mapActions instanceof Array) {
                    mapActions.forEach(actionName => {
                        extProto.actions[actionName] = function (payload) {
                            return store.dispatch(actionName, payload, _this);
                        };
                    });
                }
                else {
                    for (let key in mapActions) {
                        let actionName = mapActions[key];
                        extProto.actions[key] = function (payload) {
                            return store.dispatch(actionName, payload, _this);
                        };
                    }
                }
            }
        };

        extProto.disposed = function () {
            store.unlisten(this.__storeListener);
            this.__storeListener = null;

            store.log && emitDevtool('store-comp-disposed', {
                mapStates,
                mapActions,
                store,
                component: this,
            });

            if (typeof disposed === 'function') {
                disposed.call(this);
            }
        };

        return ReturnTarget;
    };
}

/**
 * 判断 connect 的 state 是否需要更新
 *
 * @param {Object} info state的connect信息对象
 * @param {Array} diff 数据变更的diff信息
 * @return {boolean}
 */
function calcUpdateInfo(info, diff) {
    if (info.stateName) {
        let stateNameLen = info.stateName.length;

        for (let i = 0, diffLen = diff.length; i < diffLen; i++) {
            let diffInfo = diff[i];
            let target = diffInfo.target;
            let matchThisDiff = true;
            let j = 0;
            let targetLen = target.length;

            for (; j < targetLen && j < stateNameLen; j++) {
                if (info.stateName[j] != target[j]) {
                    matchThisDiff = false;
                    break;
                }
            }

            if (matchThisDiff) {
                let updateInfo = {
                    componentData: info.dataName,
                    storeData: info.stateName
                };

                if (targetLen > stateNameLen) {
                    updateInfo.storeData = target;
                    updateInfo.componentData += '.' + target.slice(stateNameLen).join('.');
                }

                if (targetLen >= stateNameLen && diffInfo.splice) {
                    updateInfo.spliceArgs = [
                        diffInfo.splice.index,
                        diffInfo.splice.deleteCount
                    ];

                    if (diffInfo.splice.insertions instanceof Array) {
                        updateInfo.spliceArgs.push.apply(
                            updateInfo.spliceArgs,
                            diffInfo.splice.insertions
                        );
                    }
                }

                return updateInfo;
            }
        }
    }
}

/**
 * createConnector 创建连接
 *
 * @param {Store} store store实例
 * @return {Function}
 */
export default function createConnector(store) {
    if (store instanceof Store) {
        return (mapStates, mapActions) => connect(mapStates, mapActions, store);
    }

    throw new Error(store + ' must be an instance of Store!');
}
