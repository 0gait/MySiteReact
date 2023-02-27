import type { Hook } from './hooks';
import type { HookContainer } from './container';
export declare const currentComponent: {
    current: {
        getContextValue(consumer: {
            id: number;
        }): any;
        getHook: (dependencies: number | unknown[] | undefined, hookInitialization: (hook: any, addEffectHook: (effect: () => void) => void) => void) => any;
        state: {
            [x: string]: any;
        } | null;
        context: any;
    };
};
export declare function renderChild(component: HookContainer, { renderFn, renderProps, renderRef, }: any, context: any): any;
export declare function createRecorder(component: HookContainer): {
    renderResult: undefined;
    getHook(_dependencies: number | unknown[] | undefined, fn: (hook: Partial<Hook>, addEffectHook: (effect: () => void) => void) => void): any;
    shouldComponentUpdate(nextProps: {
        renderProps?: any;
        renderFn?: any;
    }, nextState: any, context: any): boolean;
    componentDidMount: () => void;
    componentDidUpdate: () => void;
    dispose(): void;
};
