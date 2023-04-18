/**
 * san-store composition api
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san组件的composition connect
 * @author errorrik, zttonly
 */

import {data, onInited, onDisposed, method} from 'san-composition';
import updateComponentConnectedData from './update-component-connected-data';
import indexDiff from './index-diff';
import parseName from './parse-name';
import {Store, store as defaultStore} from 'san-store';
import emitDevtool from './devtool/emitter';

export const version = '__VERSION__';

/**
 * 操作store内数据
 *
 * @param {Store} store store
 * @param {string|Function} stateName store内的action name 或函数
 * @param {string?} dataName 组件的data name
 * @returns {DataProxy}
 */
export function useState(store, stateName, dataName = stateName) {
    if (!(store instanceof Store)) {
        dataName = stateName || store;
        stateName = store;
        store = defaultStore;
    }

    const stateData = data(dataName);
    if (!stateData) {
        return;
    }

    // 一个store对应一个listener，一次更新多个state
    let storeListener = null;
    onInited(() => {
        const componentInstance = stateData.component;
        if (!componentInstance.__useStates) {
            componentInstance.__useStates = {};
        }
        if (!componentInstance.__useStateDatas) {
            componentInstance.__useStateDatas = {};
        }

        if (!componentInstance.__useStates[store.id]) {
            // 一个store使用一个listener
            storeListener = diff => {
                let diffIndex = indexDiff(diff);

                const useStates = componentInstance.__useStates[store.id];
                const useStateDatas = componentInstance.__useStateDatas[store.id]
                const dataNames = Object.keys(useStates);
                // init data
                for (let i = 0; i < dataNames.length; i++) {
                    const dataName = dataNames[i];
                    const stateName = useStates[dataName];

                    if (typeof stateName === 'function') {
                        useStateDatas[dataName].set(stateName(store.getState()));
                    }
                    else {
                        updateComponentConnectedData(
                            componentInstance,
                            store,
                            {
                                dataName,
                                stateName: parseName(stateName)
                            },
                            diffIndex
                        );
                    }
                }
            };
            store.listen(storeListener);
        }

        // initData
        if (typeof stateName === 'function') {
            stateData.set(stateName(store.getState()));
        }
        else {
            stateData.set(store.getState(stateName));
        }

        // save mapState
        let useStates = componentInstance.__useStates[store.id];
        if (!useStates) {
            useStates = componentInstance.__useStates[store.id] = {};
        }
        useStates[dataName] = stateName; // 声明相同的值时覆盖

        let useStateDatas = componentInstance.__useStateDatas[store.id];
        if (!useStateDatas) {
            useStateDatas = componentInstance.__useStateDatas[store.id] = {};
        }
        useStateDatas[dataName] = stateData;

        store.log && emitDevtool('store-use-state-comp-inited', {
            stateName,
            dataName,
            store,
            component: componentInstance,
        });
    });

    // 自动销毁
    onDisposed(() => {
        storeListener && store.unlisten(storeListener);
        store.log && emitDevtool('store-use-state-comp-disposed', {
            useStates: stateData.component.__useStates[store.id],
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
 * @param {string?} methodName 组件的method name
 * @returns {Function} 可被调用的 dispatch 函数
 */
export function useAction(store, actionName, methodName = actionName) {
    if (!(store instanceof Store)) {
        methodName = actionName || store;
        actionName = store;
        store = defaultStore;
    }

    return method(methodName, payload => {
        return store.dispatch(actionName, payload);
    });
}
