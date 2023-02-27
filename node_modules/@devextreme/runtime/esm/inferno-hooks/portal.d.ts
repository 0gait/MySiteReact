import { VNode } from 'inferno';
declare type PortalProps = {
    container?: HTMLElement | null;
    children: unknown;
};
export declare const Portal: ({ container, children, }: PortalProps) => VNode | null;
export {};
