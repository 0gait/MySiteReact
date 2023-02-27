import { GlobalState } from './GlobalState';
import { HookConfig, Reducer } from './types';
declare type HookReturnType<T> = [
    state: T,
    dispatch: (action: any) => any
];
declare function useGlobalStateReducer<T = any>(reducer: Reducer, globalState: GlobalState<any>, config?: HookConfig): HookReturnType<T>;
export { useGlobalStateReducer };
