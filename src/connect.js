/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file san 组件的 connect
 * @author errorrik
 */

import parseName from './parse-name';
import updateComponentConnectedData from './update-component-connected-data';
import indexDiff from './index-diff';
import defaultStore from './default-store';
import Store from './store';
import emitDevtool from './devtool/emitter';


let extendsAsClass;

try {
    extendsAsClass = new Function('RawClass', 'return class extends RawClass {}');
}
catch (ex) {}

function extendsAsFunc(RawClass) {
    let F = function () {};
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


function connect(store, mapStates, mapActions) {
    let connects = [];
    function addConnect(store, mapStates, mapActions) {
        if (!(store instanceof Store)) {
            mapActions = mapStates;
            mapStates = store;
            store = defaultStore;
        }

        let mapStateInfos = [];
        let mapStateCount = 0;
        let mapStateKeys = Object.keys(mapStates);
        for (let i = 0; i < mapStateKeys.length; i++) {
            let key = mapStateKeys[i];
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
                mapStateInfos.push(mapInfo);
                mapStateCount++;
            }
        }

        connects.push({
            mapStates,
            mapStateInfos,
            mapStateCount,
            mapActions,
            store
        });
        store.log && emitDevtool('store-connected', {
            mapStates,
            mapActions,
            store
        });
    }

    addConnect(store, mapStates, mapActions);


    function connectComponent(ComponentClass) {
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

            for (let i = 0; i < connects.length; i++) {
                const {mapStates, mapStateCount, mapStateInfos, store} = connects[i];
                // init data
                for (let j = 0; j < mapStateCount; j++) {
                    let stateInfo = mapStateInfos[j];

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
                let listener = diff => {
                    let diffIndex = indexDiff(diff);

                    for (let i = 0; i < mapStateCount; i++) {
                        let stateInfo = mapStateInfos[i];

                        if (typeof stateInfo.getter === 'function') {
                            this.data.set(
                                stateInfo.dataName,
                                stateInfo.getter(store.getState(), this)
                            );
                        }
                        else {
                            updateComponentConnectedData(this, store, stateInfo, diffIndex);
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
            for (let i = 0; i < connects.length; i++) {
                const {mapStates, mapActions, store} = connects[i];
                store.unlisten(this.__storeListeners[i]);

                store.log && emitDevtool('store-comp-disposed', {
                    mapStates,
                    mapActions,
                    store,
                    component: this,
                });
            }

            if (typeof disposed === 'function') {
                disposed.call(this);
            }
        };

        // map actions
        if (!extProto.actions) {
            extProto.actions = {};

            for (let i = 0; i < connects.length; i++) {
                const {mapActions, store} = connects[i];
                if (!mapActions) {
                    continue;
                }

                if (mapActions instanceof Array) {
                    for (let i = 0; i < mapActions.length; i++) {
                        let actionName = mapActions[i];
                        extProto.actions[actionName] = function (payload) {
                            return store.dispatch(actionName, payload);
                        };
                    }
                }
                else {
                    const actions = Object.keys(mapActions);
                    for (let i = 0; i < actions.length; i++) {
                        let methodName = actions[i];
                        let actionName = mapActions[methodName];
                        extProto.actions[methodName] = function (payload) {
                            return store.dispatch(actionName, payload);
                        };
                    }
                }
            }
        }

        return ReturnTarget;
    }

    connectComponent.connect = function (store, mapStates, mapActions) {
        addConnect(store, mapStates, mapActions);
        return connectComponent;
    };

    return connectComponent;
}

connect.createConnector = function (store) {
    if (store instanceof Store) {
        return (mapStates, mapActions) => connect(store, mapStates, mapActions);
    }

    throw new Error(store + ' must be an instance of Store!');
};

connect.san = function (store, mapStates, mapActions) {
    return connect(store, mapStates, mapActions);
};

export default connect;
