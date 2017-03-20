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
        let componentProto;

        switch (typeof ComponentClass) {
            case 'function':
                componentProto = ComponentClass.prototype;
                break;
            case 'object':
                componentProto = ComponentClass;
                break;
        }

        if (!componentProto) {
            return;
        }

        // map states
        let inited = componentProto.inited;
        componentProto.inited = function () {
            // init data
            mapStateInfo.forEach(info => {
                if (typeof info.getter === 'function') {
                    this.data.set(info.dataName, info.getter(store.getState()));
                }
                else {
                    this.data.set(info.dataName, clone(store.getState(info.stateName)));
                }
            });

            // listen store change
            this._storeListener = diff => {
                mapStateInfo.forEach(info => {
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
                            this.data.set(updateInfo.componentData, clone(store.getState(updateInfo.storeData)));
                        }
                    }
                });
            };
            store.listen(this._storeListener);

            if (typeof inited === 'function') {
                inited.call(this);
            }
        };

        let disposed = componentProto.disposed;
        componentProto.disposed = function () {
            store.unlisten(this._storeListener);
            this._storeListener = null;

            if (typeof disposed === 'function') {
                disposed.call(this);
            }
        };

        // map actions
        if (!componentProto.actions) {
            componentProto.actions = {};

            if (mapActions instanceof Array) {
                mapActions.forEach(actionName => {
                    componentProto.actions[actionName] = function (payload) {
                        store.dispatch(actionName, payload);
                    };
                });
            }
            else {
                for (let key in mapActions) {
                    let actionName = mapActions[key];
                    componentProto.actions[key] = function (payload) {
                        store.dispatch(actionName, payload);
                    };
                }
            }
        }

        return ComponentClass;
    };
}


function clone(source) {
    if (source == null) {
        return source;
    }

    if (typeof source === 'object') {
        if (source instanceof Array) {
            return source.map(item => clone(item));
        }
        else if (source instanceof Date) {
            return new Date(source.getTime());
        }

        let result = {};
        for (let key in source) {
            result[key] = clone(source[key]);
        }

        return result;
    }

    return source;
}

/**
 * 判断 connect 的 state 是否需要更新
 *
 * @param {Object} info state的connect信息对象
 * @param {Array} diff 数据变更的diff信息
 * @return {boolean}
 */
function calcUpdateInfo(info, diff){
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
