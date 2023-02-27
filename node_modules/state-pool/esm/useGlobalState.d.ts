import { GlobalState } from './GlobalState';
import { HookConfig } from './types';
declare type HookReturnType<T> = [
    state: T,
    setState: (state: any) => any,
    updateState: (updater: (currentState: any) => any) => any
];
declare function useGlobalState<T>(globalState: GlobalState<any>, config?: HookConfig): HookReturnType<T>;
export { useGlobalState };
