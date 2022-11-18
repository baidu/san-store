/**
 * san-store composition api
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san组件的composition connect
 * @author errorrik, zttonly
 */

import {data, onInited, onDisposed} from 'san-composition';
import {calcUpdateInfo} from './createConnector';
import parseName from '../parse-name';

export function useState(store, name, stateName = name) {
    const stateData = data(name);
    if (!stateData) {
        return;
    }
    // 一个store使用一个listener
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
                for (let dataName in mapStates) {
                    if (mapStates.hasOwnProperty(dataName)) {
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
    });
    // 自动销毁
    onDisposed(() => {
        storeListener && store.unlisten(storeListener);
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
export function useAction(store, actionName) {

    return function (payload) {
        return store.dispatch(actionName, payload);
    };
}
