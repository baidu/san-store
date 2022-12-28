import type {DataProxy} from 'san-composition';
import type {Component} from 'san';

type Func = () => any;
type StringObj = {[key:string]: any};

interface Options {
    initData?: {
        [key: string]: any
    },
    actions?: {
        [key: string]: any
    },
    log?: boolean,
    name?: string,
}

export declare class Store {
    actions: StringObj;
    log: boolean;
    name?: string;
    id: string;

    constructor(options: Options);

    getState(name: string): any;

    listen(listener: Func): void;
    unlisten(listener: Func): void;

    addAction(name: string, action: Func): void;
    dispatch(name: string, payload: any): Function;
}

export declare function useState(stateName: string, dataName?: string): DataProxy;
export declare function useState(stateName: (state: any) => any, dataName: string): DataProxy;
export declare function useState(store: Store, stateName: string, dataName?:string): DataProxy;
export declare function useState(store: Store, stateName: (state: any) => any, dataName: string): DataProxy;

export declare function useAction(actionName: string, methodName?: string): Func;
export declare function useAction(store: Store, actionName: string, methodName?: string): Func;

type MapStates = {[key: string]: string | Func;}  | string[];
type MapActions = string[];

export declare function connect(store: Store, mapStates: MapStates, mapActions: MapActions): Component;
type ConnectComponent = {
    (ComponentClass: Component): Component;
    connect(store: Store, mapStates: MapStates, mapActions: MapActions): ConnectComponent;
}
export declare function connect(store: Store, mapStates: MapStates, mapActions: MapActions): ConnectComponent;
