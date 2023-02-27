import { EventDispatcher } from "../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { IVisualizersListener } from "../../Events/EventManager";

export class SelectionRectVisualizer {
    private rect: Rectangle;
    constructor(private dispatcher: EventDispatcher<IVisualizersListener>) {}

    setRectangle(rect: Rectangle) {
        this.rect = rect;
        this.raiseShow();
    }
    reset() {
        this.rect = undefined;
        this.raiseHide();
    }

    protected raiseShow() {
        this.dispatcher.raise1(l => l.notifySelectionRectShow(this.rect));
    }
    protected raiseHide() {
        this.dispatcher.raise1(l => l.notifySelectionRectHide());
    }
}
