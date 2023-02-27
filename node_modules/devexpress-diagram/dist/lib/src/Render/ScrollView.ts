import { EventDispatcher } from "../Utils";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { RenderHelper } from "./RenderHelper";

export class NativeScrollView implements IScrollView {
    scrollBarWidth: number;
    mainElement: HTMLElement;
    onScroll: EventDispatcher<IScrollViewListener> = new EventDispatcher();

    private onScrollHandler: any;

    constructor(mainElement: HTMLElement) {
        this.scrollBarWidth = DomUtils.getVerticalScrollBarWidth();
        this.mainElement = mainElement;

        this.attachEvents();
    }

    private attachEvents() {
        this.onScrollHandler = () => this.onScroll.raise1(l => l.notifyScrollChanged(() => this.getScroll()));
        RenderHelper.addEventListener(this.mainElement, "scroll", this.onScrollHandler);
    }
    detachEvents() {
        RenderHelper.removeEventListener(this.mainElement, "scroll", this.onScrollHandler);
    }

    getScrollContainer(): HTMLElement {
        return this.mainElement;
    }

    setScroll(left: number, top: number) {
        this.mainElement.style.overflow = "scroll";
        this.mainElement.scrollLeft = left;
        this.mainElement.scrollTop = top;
        this.mainElement.style.overflow = "";
        this.onScroll.raise1(l => l.notifyScrollChanged(() => this.getScroll()));
    }
    offsetScroll(left: number, top: number) {
        if(left)
            this.mainElement.scrollLeft += left;
        if(top)
            this.mainElement.scrollTop += top;
        this.onScroll.raise1(l => l.notifyScrollChanged(() => this.getScroll()));
    }
    private getScroll(): Point {
        return new Point(this.mainElement.scrollLeft, this.mainElement.scrollTop);
    }
    getSize(): Size {
        const boundingRect = this.mainElement.getBoundingClientRect();
        return new Size(Math.floor(boundingRect.width), Math.floor(boundingRect.height));
    }
    getScrollBarWidth(): number {
        return this.scrollBarWidth;
    }
}

export interface IScrollView {
    setScroll(left: number, top: number);
    offsetScroll(left: number, top: number);
    getSize(): Size;
    getScrollBarWidth(): number;
    getScrollContainer(): HTMLElement;
    onScroll: EventDispatcher<IScrollViewListener>;
    detachEvents();
}

export interface IScrollViewListener {
    notifyScrollChanged(getScroll: () => Point);
}
