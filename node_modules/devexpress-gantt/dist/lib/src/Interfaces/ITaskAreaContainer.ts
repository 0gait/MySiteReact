export interface ITaskAreaContainer {
    scrollTop: number;
    scrollLeft: number;
    scrollWidth: number;
    scrollHeight: number;
    getWidth(): number;
    getHeight(): number;
    getElement(): HTMLElement;
    detachEvents(): void;
    isExternal: boolean;
}
