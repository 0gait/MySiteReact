declare type Selector<T> = (state: any) => T;
declare type Patcher = (state: any, selectedStateValue: any) => void;
declare type Reducer = (state: any, action: any) => any;
declare type HookConfig = {
    patcher?: Patcher;
    selector?: Selector<any>;
};
declare type Unsubscribe = () => void;
export { Selector, Patcher, Reducer, HookConfig, Unsubscribe };
