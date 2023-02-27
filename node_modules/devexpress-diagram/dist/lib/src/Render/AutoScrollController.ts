import { IScrollView } from "./ScrollView";
import { svgNS } from "./RenderHelper";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { CanvasViewManager } from "./CanvasViewManager";
import { IDOMManipulator } from "./DOMManipulator";
import { EventUtils } from "../Utils";

const SCROLL_EDGE = 40;
const SCROLL_RATIO = 5;
const SCROLL_MAXOFFSET = 5;
const SCROLL_DELAY = 50;

export class AutoScrollController {
    private leftButtonPressed = false;
    private scrollDragging = false;

    private scrollTimer: number = -1;
    private readonly scrollBarWidth: number = DomUtils.getVerticalScrollBarWidth();
    constructor(
        private scroll: IScrollView,
        private svgElement: SVGElement,
        private view: CanvasViewManager,
        private dom: IDOMManipulator
    ) { }

    onMouseMove(evt: MouseEvent, raiseMouseMoveFunc: () => void) {
        this.clearScrollTimer();
        if(!EventUtils.isLeftButtonPressed(evt))
            this.leftButtonPressed = false;
        if(this.canAutoScroll())
            this.changeScrollPosition(evt, raiseMouseMoveFunc, false);
    }
    onMouseDown(evt: MouseEvent) {
        this.leftButtonPressed = !!EventUtils.isLeftButtonPressed(evt);
    }
    onMouseUp(evt: MouseEvent) {
        this.clearScrollTimer();
        this.leftButtonPressed = false;
    }
    onMouseEnter(evt: MouseEvent) {
        if(EventUtils.isLeftButtonPressed(evt))
            setTimeout(() => {
                this.leftButtonPressed = true;
            }, 500);

    }
    onDragScrollStart() {
        this.scrollDragging = true;
    }
    onDragScrollEnd() {
        this.scrollDragging = false;
    }

    private canAutoScroll() {
        return this.leftButtonPressed && !this.scrollDragging;
    }

    private changeScrollPosition(evt: MouseEvent, raiseMouseMoveFunc: () => void, raiseMouseMove: boolean) {
        let changed = false;
        if(!this.view.isAutoScrollLocked()) {
            const scrollContainer = this.scroll.getScrollContainer();
            const x = evt.pageX - DomUtils.getAbsolutePositionX(scrollContainer);
            const y = evt.pageY - DomUtils.getAbsolutePositionY(scrollContainer);
            const size = this.scroll.getSize();
            const scrollSize = new Size(parseFloat(this.svgElement.style.width), parseFloat(this.svgElement.style.height));
            let width = size.width;
            if(size.width < scrollSize.width)
                width -= this.scrollBarWidth;
            let height = size.height;
            if(size.height < scrollSize.height)
                height -= this.scrollBarWidth;

            if(x <= SCROLL_EDGE) {
                this.dom.changeByFunc(null, () => {
                    if(!this.view.isAutoScrollLocked())
                        this.scroll.offsetScroll(-this.getScrollingOffset(x), 0);
                });
                changed = true;
            }
            else if(width - SCROLL_EDGE <= x) {
                this.dom.changeByFunc(null, () => {
                    if(!this.view.isAutoScrollLocked())
                        this.scroll.offsetScroll(this.getScrollingOffset(width - x), 0);
                });
                changed = true;
            }
            if(y <= SCROLL_EDGE) {
                this.dom.changeByFunc(null, () => {
                    if(!this.view.isAutoScrollLocked())
                        this.scroll.offsetScroll(0, -this.getScrollingOffset(y));
                });
                changed = true;
            }
            else if(height - SCROLL_EDGE <= y) {
                this.dom.changeByFunc(null, () => {
                    if(!this.view.isAutoScrollLocked())
                        this.scroll.offsetScroll(0, this.getScrollingOffset(height - y));
                });
                changed = true;
            }
        }

        if(changed || this.view.isAutoScrollLocked())
            this.scrollTimer = window.setTimeout(() => this.changeScrollPosition(evt, raiseMouseMoveFunc, changed), SCROLL_DELAY);

        if(raiseMouseMove)
            raiseMouseMoveFunc();
    }
    private clearScrollTimer() {
        if(this.scrollTimer > -1) {
            window.clearTimeout(this.scrollTimer);
            this.scrollTimer = -1;
        }
    }
    private getScrollingOffset(edgeOffset: number) {
        const offset = Math.pow((SCROLL_EDGE - edgeOffset) / SCROLL_RATIO, 2);
        return Math.round(Math.min(offset, SCROLL_MAXOFFSET));
    }

    static createMainElement(parent: HTMLElement): HTMLDivElement {
        const element = document.createElement("div");
        element.setAttribute("class", "dxdi-control");
        parent.appendChild(element);
        return element;
    }
    static createSvgElement(parent: HTMLElement, forExport: boolean = false): SVGSVGElement {
        const svgElement = document.createElementNS(svgNS, "svg");
        svgElement.className.baseVal = "dxdi-canvas" + (forExport ? " export" : "");
        parent.appendChild(svgElement);
        return svgElement;
    }
}
