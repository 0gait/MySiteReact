import { Component } from 'inferno';
import { InfernoEffect } from './effect';
export declare class BaseInfernoComponent<P = Record<string, unknown>, S = Record<string, unknown>> extends Component<P, S> {
    _pendingContext: any;
    componentWillReceiveProps(_: any, context: any): void;
    shouldComponentUpdate(nextProps: P, nextState: S): boolean;
}
export declare class InfernoComponent<P = Record<string, unknown>, S = Record<string, unknown>> extends BaseInfernoComponent<P, S> {
    _effects: InfernoEffect[];
    createEffects(): InfernoEffect[];
    updateEffects(): void;
    componentWillMount(): void;
    componentWillUpdate(_nextProps?: P, _nextState?: S, _context?: any): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    destroyEffects(): void;
    componentWillUnmount(): void;
}
interface VDomCustomClassesData {
    previous: string[];
    removed: string[];
    added: string[];
}
declare type ElementWithCustomClassesData = Element & {
    dxClasses: VDomCustomClassesData;
};
export declare class InfernoWrapperComponent<P = Record<string, unknown>, S = Record<string, unknown>> extends InfernoComponent<P, S> {
    vDomElement: ElementWithCustomClassesData | null;
    vDomUpdateClasses(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    shouldComponentUpdate(nextProps: P, nextState: S): boolean;
}
export {};
