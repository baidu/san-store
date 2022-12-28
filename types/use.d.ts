import type {DataProxy} from 'san-composition'
import {Store} from './index'

type ActionInvoker =  (payload: any) => Promise<void> | void;

export function useState(stateName: string, dataName?: string): DataProxy;
export function useState(stateName: (state: any) => any, dataName: string): DataProxy;
export function useState(store: Store, stateName: string, dataName?:string): DataProxy;
export function useState(store: Store, stateName: (state: any) => any, dataName: string): DataProxy;

export function useAction(actionName: string, methodName?: string): ActionInvoker;
export function useAction(store: Store, actionName: string, methodName?: string): ActionInvoker;
