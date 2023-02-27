interface IModel {
    item: (HTMLElement & {
        get: (index: number) => HTMLElement;
    }) | any;
    index: number;
    container: HTMLElement & {
        get?: (index: number) => HTMLElement;
    };
}
export declare const renderTemplate: (template: any, model: IModel, component?: any) => void;
export declare const hasTemplate: (name: string, props: Record<string, unknown>, _component?: any) => boolean;
export {};
