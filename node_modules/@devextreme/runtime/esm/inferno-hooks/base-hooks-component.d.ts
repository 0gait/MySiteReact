import { HookContainer } from './container';
interface VDomCustomClassesData {
    previous: string[];
    removed: string[];
    added: string[];
}
declare type ElementWithCustomClassesData = Element & {
    dxClasses: VDomCustomClassesData;
};
export declare class InfernoWrapperComponent extends HookContainer {
    vDomElement: ElementWithCustomClassesData | null;
    vDomUpdateClasses(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    shouldComponentUpdate(nextProps: Record<string, unknown>, nextState: Record<string, unknown>, context: Record<string, unknown> | undefined): boolean;
}
export {};
