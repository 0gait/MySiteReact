import { ITaskAreaContainer } from "../../Interfaces/ITaskAreaContainer";
import { GanttView } from "../GanttView";

export class TaskAreaContainer implements ITaskAreaContainer {
    private element: HTMLElement;
    private onScrollHandler: any;

    constructor(element: HTMLElement, ganttView: GanttView) {
        this.element = element;
        this.onScrollHandler = () => { ganttView.updateView(); };
        this.element.addEventListener("scroll", this.onScrollHandler);
    }

    get scrollTop(): number {
        return this.element.scrollTop;
    }
    set scrollTop(value: number) {
        this.element.scrollTop = value;
    }

    get scrollLeft(): number {
        return this.element.scrollLeft;
    }
    set scrollLeft(value: number) {
        this.element.scrollLeft = value;
    }

    get scrollWidth(): number {
        return this.element.scrollWidth;
    }

    get scrollHeight(): number {
        return this.element.scrollHeight;
    }

    get isExternal(): boolean {
        return false;
    }

    getWidth(): number {
        return this.element.offsetWidth;
    }
    getHeight(): number {
        return this.element.offsetHeight;
    }
    getElement(): HTMLElement {
        return this.element;
    }
    detachEvents():void {
        this.element.removeEventListener("scroll", this.onScrollHandler);
    }
}
