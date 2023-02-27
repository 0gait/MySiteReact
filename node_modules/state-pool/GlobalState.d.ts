import { Selector, HookConfig, Unsubscribe } from './types';
declare type Observer = (value: any) => void;
declare type Updater = (state: any) => void;
declare type StateUpdater = (state: any) => any;
declare type Refresh = () => void;
declare type Subscriber = {
    observer: Observer;
    selector: Selector<any>;
    refresh?: Refresh;
};
declare class GlobalState<T> {
    private value;
    private subscribers;
    constructor(initialValue: T);
    getValue<ST>(selector?: Selector<ST>): T | ST;
    refresh(): void;
    setValue(newValue: T | StateUpdater, config?: HookConfig): void;
    updateValue(updater: Updater, config?: HookConfig): void;
    private __updateValue;
    subscribe(itemToSubscribe: Subscriber | Observer): Unsubscribe;
    select<T>(selector: Selector<T>): DerivedGlobalState<T>;
}
declare class DerivedGlobalState<T> {
    globalState: GlobalState<any>;
    selector: Selector<T>;
    constructor(globalState: GlobalState<any>, selector: Selector<T>);
    getValue(): T;
    subscribe(observer?: Observer, refresh?: Refresh): Unsubscribe;
}
declare function createGlobalstate<T>(initialValue: T): GlobalState<T>;
export { GlobalState, DerivedGlobalState, createGlobalstate };
