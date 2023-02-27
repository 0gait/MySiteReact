interface IProps {
    item: (HTMLElement & {
        get: (index: number) => HTMLElement;
    }) | any;
    index: number;
    container: HTMLElement & {
        get: (index: number) => HTMLElement;
    };
}
export declare function renderTemplate(template: string, props: IProps, _component?: unknown): void;
export declare const hasTemplate: (name: string, properties: Record<string, unknown>, _component: unknown) => boolean;
export {};
