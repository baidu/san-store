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

interface DIFF {
    $change: StringObj,
    target: string[],
    oldValue: any,
    newValue: any,
    splice?: {
        index: number,
        deleteCount?: number,
        insertions: any[],
    },
}

type actionInfo = {
    id: string;
    name: string;
    parentId?: string;
    childs: string[];
    payload?: any;
    startTime?: number;
    selfDone: boolean;
    done: boolean;
    endTime?: number;
}

type stateChangeLog = {
    oldValue: any;
    newValue: any;
    diff: DIFF;
    id: String;
}

export declare class Store {
    raw: StringObj;
    actions: StringObj;
    log: boolean;
    name?: string;
    id: string;
    listeners: Func[];
    stateChangeLogs: stateChangeLog[];
    actionInfos: actionInfo[];
    actionInfoIndex: {[key: string]: number}[];
    aiLen: number;
    stateGetter: (name: string) => any;

    constructor(options: Options);

    getState(name: string): any;

    listen(listener: Func): void;
    unlisten(listener: Func): void;

    addAction(name: string, action: Func): void;
    dispatch(name: string, payload: any): Function;

    _fire(diff: DIFF): void;
    _dispatch(name: string, payload: any, parentId: string): void;
    _getActionInfo(id: string): actionInfo | void;
    _actionStart(
        id: string,
        name: string,
        action: Func,
        payload: any,
        parentId?: string
    ): any;
    _actionDone(id: string): void;
    _detectActionDone(id: string): boolean | void;
}

type MapStates = {[key: string]: string | Func;}  | string[];
type MapActions = string[];

export declare function useState(store: Store, stateName: string | ((state: any) => {}), dataName?:string): DataProxy;
export declare function useAction(store: Store, actionName: string, methodName?: string): void;

type ConnectComponent = {
    (ComponentClass: Component): Component;
    connect(store: Store, mapStates: MapStates, mapActions: MapActions): ConnectComponent;
}

export declare function connect(store: Store, mapStates: MapStates, mapActions: MapActions): ConnectComponent;
