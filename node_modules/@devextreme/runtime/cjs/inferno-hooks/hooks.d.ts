export interface Hook {
    isNew: boolean;
    id: string | number;
    $setState: (setter: any) => any;
    value: any;
    dispose: any;
    didMount: any;
    dependencies?: number | unknown[];
    effect?: () => void;
    newDeps?: number | unknown[];
}
export declare type SetStateAction<S> = S | ((prevState: S) => S);
export declare type Dispatch<A> = (value: A) => void;
export declare function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
export declare function useEffect(fn: () => any, dependencies?: unknown[]): any;
export declare function useMemo<T>(fn: () => T, dependencies: unknown[]): T;
export declare function useCallback<T extends (...args: never[]) => unknown>(fn: T, dependencies: unknown[]): T;
export declare function useImperativeHandle(ref: any, init: () => any, dependencies?: any): any;
export declare function useContext(consumer: {
    id: number;
    defaultValue: unknown;
}): any;
export declare function useRef<T>(initialValue?: T | null): any;
