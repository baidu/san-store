/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san组件的connect
 * @author errorrik
 */

import {connect} from './createConnector';
import Store from '../store';

/**
 * 创建sanConnector链式connect对象
 *
 * @param {Array?} storeCollection store相关数据集合
 * @return {function(ComponentClass)}
 */

export default function createSanConnector(defaultStore, storeCollection = []) {
    const sanConnector = function (ComponentClass) {
        const finalCollection = storeCollection;
        storeCollection = [];
        return connect(finalCollection)(ComponentClass);
    };
    // 支持sanConnector.connect(store, mapStates, mapActions) 或 sanConnector.connect(mapStates, mapActions)
    sanConnector.connect = (storeOrMapStates, mapStatesOrActions, actions) => {
        if (!(defaultStore instanceof Store && storeOrMapStates instanceof Store)) {
            throw new Error('store must be supplied!');
        }

        let store = storeOrMapStates;
        let mapStates = mapStatesOrActions;
        let mapActions = actions;
        if (!storeOrMapStates instanceof Store) {
            store = defaultStore;
            mapStates = storeOrMapStates;
            mapActions = mapStatesOrActions;
        }
        storeCollection.push({
            mapStates,
            mapActions,
            store
        });
        return sanConnector;
    };

    return sanConnector;
}
