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
    NewComponentClass.messages = ComponentClass.messages;

    return NewComponentClass;
}

/**
 * 统一处理 mapStates，mapstatus 现在可以传递 ['name', 'age'...]这种形式。
 *
 * @param {Object} mapStates 状态到组件数据的映射信息
 * @return {Array}
 */
function formatStateMapper(mapStates) {
    let mapStateInfo = [];
    // 支持直接传递 ['name', 'age'...] 来替代 {name: 'name', age: 'age'}
    if (mapStates instanceof Array) {
        for (let i = 0; i < mapStates.length; i++) {
            let mapState = mapStates[i];
            typeof mapState === 'string' && mapStateInfo.push({
                dataName: mapState,
                stateName: parseName(mapState)
            });
        }
        return mapStateInfo;
    }
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
    return mapStateInfo;
}


// 给用户的 comp 添加 store 的监听 和 卸载监听
function addMapperListenerOnComponent(mappers, store, getMappersOnComponent) {
    function getCompMappers(comp) {
        let mapStates = [];
        comp.mapStates && (mapStates = mapStates.concat(formatStateMapper(comp.mapStates)));
        comp.mapGetters && (mapStates = mapStates.concat(formatStateMapper(comp.mapGetters)));
        return {
            mapStates,
            mapActions: comp.mapActions
        };
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

        getMappersOnComponent && (mappers = getCompMappers(extProto));

        let inited = componentProto.inited;
        let disposed = componentProto.disposed;

        extProto.inited = function () {

            // init data
            mappers.mapStates.forEach(info => {
                if (typeof info.getter === 'function') {
                    this.data.set(info.dataName, info.getter(store.getState()));
                }
                else {
                    this.data.set(info.dataName, store.getState(info.stateName));
                }
            });

            // listen store change
            this.__storeListener = diff => {
                mappers.mapStates.forEach(info => {
                    if (typeof info.getter === 'function') {
                        this.data.set(info.dataName, info.getter(store.getState()));
                        return;
                    }

                    let updateInfo = calcUpdateInfo(info, diff);
                    if (updateInfo) {
                        if (updateInfo.spliceArgs) {
                            this.data.splice(updateInfo.componentData, updateInfo.spliceArgs);
                        }
                        else {
                            this.data.set(updateInfo.componentData, store.getState(updateInfo.storeData));
                        }
                    }
                });
            };
            store.listen(this.__storeListener);

            emitDevtool('store-comp-inited', {
                mapStates: mappers.mapStates,
                mapActions: mappers.mapActions,
                store,
                component: this
            });

            if (typeof inited === 'function') {
                inited.call(this);
            }
        };

        extProto.disposed = function () {
            store.unlisten(this.__storeListener);
            this.__storeListener = null;

            emitDevtool('store-comp-disposed', {
                mapStates: mappers.mapStates,
                mapActions: mappers.mapActions,
                store,
                component: this
            });

            if (typeof disposed === 'function') {
                disposed.call(this);
            }
        };

        // map actions
        if (!extProto.actions) {
            extProto.actions = {};

            if (mappers.mapActions instanceof Array) {
                mappers.mapActions.forEach(actionName => {
                    extProto.actions[actionName] = function (payload) {
                        return store.dispatch(actionName, payload);
                    };
                });
            }
            else {
                for (let key in mappers.mapActions) {
                    let actionName = mappers.mapActions[key];
                    extProto.actions[key] = function (payload) {
                        return store.dispatch(actionName, payload);
                    };
                }
            }
        }

        return ReturnTarget;
    };
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
    let mapStateInfo = formatStateMapper(mapStates);

    emitDevtool('store-connected', {
        mapStates,
        mapActions,
        store
    });

    return addMapperListenerOnComponent({
        mapStates: mapStateInfo,
        mapActions
    }, store);
}

function connectMapper(store) {
    let getMappersOnComponent = true;
    return addMapperListenerOnComponent(null, store, getMappersOnComponent);
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
export const createConnector = store => {
    if (store instanceof Store) {
        return (mapStates, mapActions) => connect(mapStates, mapActions, store);
    }

    throw new Error(store + ' must be an instance of Store!');
};
export const createMapperConnector = store => {
    if (store instanceof Store) {
        return connectMapper(store);
    }

    throw new Error(store + ' must be an instance of Store!');
};
