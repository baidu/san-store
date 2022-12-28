
import type {DefinedComponentClass} from 'san';



interface UpdateBuilder {
    buildWithDiff: () => (oldObject: {}) => {}
}

interface StoreOptions {
    initData?: {
        [key: string]: any
    },
    actions?: {
        [key: string]: Action
    },
    log?: boolean,
    name?: string,
}

interface StateChangeInfo {
    $change: string;
    target: string[];
    oldValue: any;
    newValue: any;
    splice?: {
        index: number;
        deleteCount: number;
        insertions: any[];
    };
}

interface StoreChangeListener {
    (this: Store, changes: StateChangeInfo[]): void
}

type Action = (
    payload: any, 
    context?: {
        getState?: (name: string) => any;
        dispatch?: (name: string, payload: any) => Promise<void> | void; 
    }
) => Promise<void> | UpdateBuilder | void;

type StateSelector =  (states: {}) => any;
type MapStates = {[key: string]: string | StateSelector} | string[];
type MapActions = {[key: string]: string} | string[];

export class Store {
    log: boolean;
    name?: string;
    id: string;

    constructor(options: StoreOptions);

    getState(name: string): any;

    listen(listener: StoreChangeListener): void;
    unlisten(listener: StoreChangeListener): void;

    addAction(name: string, action: Action): void;
    dispatch(name: string, payload: any): Promise<void> | void;
}

interface Connector {
    (ComponentClass: DefinedComponentClass<{}, {}>): DefinedComponentClass<{}, {}>;
    connect(mapStates: MapStates): Connector;
    connect(store: Store, mapStates: MapStates): Connector;
    connect(mapStates: MapStates, mapActions: MapActions): Connector;
    connect(store: Store, mapStates: MapStates, mapActions: MapActions): Connector;
}

export function connect(mapStates: MapStates): Connector;
export function connect(store: Store, mapStates: MapStates): Connector;
export function connect(mapStates: MapStates, mapActions: MapActions): Connector;
export function connect(store: Store, mapStates: MapStates, mapActions: MapActions): Connector;

export const version: string;
export const store: Store;
