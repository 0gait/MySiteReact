import { Component } from 'inferno';
import { createRecorder } from './recorder';
export interface RefObject<T> {
    current: T | null;
}
export declare class HookContainer extends Component<{
    renderFn: (props: any, ref?: any) => JSX.Element;
    renderProps?: Record<string, unknown>;
    renderRef?: RefObject<Record<string, unknown>>;
}, Record<string, unknown>> {
    recorder: ReturnType<typeof createRecorder> | undefined;
    state: Record<string, unknown>;
    refs: any;
    componentWillMount(): void;
    componentDidMount(): void;
    shouldComponentUpdate(nextProps: Record<string, unknown>, nextState: Record<string, unknown>, context: Record<string, unknown> | undefined): boolean;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    getHook(dependencies: number | unknown[] | undefined, fn: any): any;
    getContextValue(consumer: {
        id: number;
    }): unknown;
    dispose(): void;
    render(): JSX.Element;
}
