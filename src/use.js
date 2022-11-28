/**
 * san-store composition api
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san组件的composition connect
 * @author errorrik, zttonly
 */

import {data, onInited, onDisposed, method} from 'san-composition';
import calcUpdateInfo from './calc-update-info';
import parseName from './parse-name';
import Store from './store';
import emitDevtool from './devtool/emitter';

function useState(store, name, stateName = name) {
    const stateData = data(name);
    if (!stateData) {
        return;
    }
    // 一个store对应一个listener，一次更新多个state
    let storeListener = null;
    onInited(() => {
        const componentInstance = stateData.component;
        if (!componentInstance.__mapStates) {
            componentInstance.__mapStates = new Map();
        }
        if (!componentInstance.__mapStates.has(store)) {
            // 一个store使用一个listener
            storeListener = diff => {
                const mapStates = componentInstance.__mapStates.get(store);
                const mapStatesKey = Object.keys(mapStates);
                // init data
                for (let i = 0; i < mapStatesKey.length; i++) {
                    const dataName = mapStatesKey[i];
                    if (typeof mapStates[dataName] === 'function') {
                        componentInstance.data.set(
                            dataName,
                            mapStates[dataName](store.getState(), componentInstance)
                        );
                    }
                    else {
                        let updateInfo = calcUpdateInfo({
                            dataName,
                            stateName: parseName(mapStates[dataName])
                        }, diff);

                        if (updateInfo) {
                            if (updateInfo.spliceArgs) {
                                componentInstance.data.splice(updateInfo.componentData, updateInfo.spliceArgs);
                            }
                            else {
                                componentInstance.data.set(
                                    updateInfo.componentData,
                                    store.getState(updateInfo.storeData)
                                );
                            }
                        }
                    }
                }
            };
            store.listen(storeListener);
        }
        // initData
        if (typeof stateName === 'function') {
            stateData.set(stateName(store.getState(), componentInstance));
        }
        else {
            stateData.set(store.getState(stateName));
        }
        // save mapState
        let mapStates = componentInstance.__mapStates.get(store) || {};
        // 声明相同的值时覆盖
        mapStates[name] = stateName;
        componentInstance.__mapStates.set(store, mapStates);
        store.log && emitDevtool('store-comp-inited', {
            mapStates,
            store,
            component: componentInstance,
        });
    });
    // 自动销毁
    onDisposed(() => {
        storeListener && store.unlisten(storeListener);
        store.log && emitDevtool('store-comp-disposed', {
            mapStates: stateData.component.__mapStates.get(store),
            store,
            component: stateData.component
        });
    });
    return stateData;
};

/**
 * 操作store内方法
 *
 * @param {Store} store store
 * @param {string} actionName store内的action name
 * @returns {Function}
 */
function useAction(store, actionName) {
    method(actionName, payload => {
        return store.dispatch(actionName, payload);
    });
}

export function createUseHelper(defaultStore) {
    if (defaultStore instanceof Store) {
        return {
            useState: (storeOrName, name, stateName) => {
                if (!storeOrName instanceof Store) {
                    return useState(defaultStore, storeOrName, name);
                }
                return useState(storeOrName, name, stateName);
            },
            useAction: (storeOrName, name) => {
                if (!storeOrName instanceof Store) {
                    return useAction(defaultStore, storeOrName);
                }
                return useAction(storeOrName, name);
            }
        };
    }
    throw new Error(defaultStore + ' must be an instance of Store!');
}
