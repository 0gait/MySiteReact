import { GlobalState } from './GlobalState';
import { Patcher, Selector, Reducer } from './types';
declare type StoreObserver = (key: string, value: any) => void;
declare type StoreHookConfig<T> = {
    default?: T;
    selector?: Selector<any>;
    patcher?: Patcher;
    persist?: boolean;
};
declare type PersistenceConfig = {
    saveState: (key: string, state: any, isInitialSet: boolean) => void;
    loadState: (key: string, noState: Empty) => any;
    removeState?: (key: string) => void;
    clear?: () => void;
    PERSIST_ENTIRE_STORE?: boolean;
};
declare class Empty {
}
declare class Store {
    private states;
    private subscribers;
    private persistentStorage;
    constructor();
    subscribe(observer: StoreObserver): () => void;
    private onStoreUpdate;
    persist(config: PersistenceConfig): void;
    setState<T>(key: string, initialValue: T, { persist }?: {
        persist?: boolean;
    }): void;
    getState<T>(key: string, config?: {
        default?: T | Empty;
        persist?: boolean;
    }): GlobalState<any>;
    clear(fn?: () => void): void;
    remove(globalStatekey: string | string[], fn?: () => void): void;
    useState<ST = any, T = any>(key: string, config?: StoreHookConfig<T>): [state: ST, setState: (state: any) => any, updateState: (updater: (currentState: any) => any) => any];
    useReducer<ST = any, T = any>(reducer: Reducer, key: string, config?: StoreHookConfig<T>): [state: ST, dispatch: (action: any) => any];
}
declare function createStore(): Store;
export { Store, createStore };
