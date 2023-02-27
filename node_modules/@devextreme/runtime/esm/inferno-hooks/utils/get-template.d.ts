import { Props, VNode } from 'inferno';
export declare const getTemplate: (TemplateProp: (Function & {
    defaultProps: unknown;
}) | (import("inferno").ForwardRef & {
    defaultProps: unknown;
}) | (import("inferno").IComponent<any, any> & {
    defaultProps: unknown;
})) => Function | import("inferno").ForwardRef | import("inferno").IComponent<any, any> | ((props?: Props<unknown, Element> | null | undefined) => VNode);
