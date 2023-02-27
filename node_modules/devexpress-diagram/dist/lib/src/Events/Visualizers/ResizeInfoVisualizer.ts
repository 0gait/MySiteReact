import { EventDispatcher } from "../../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { IVisualizersListener } from "../EventManager";

export class ResizeInfoVisualizer {
    private point: Point;
    private text: string;

    constructor(private dispatcher: EventDispatcher<IVisualizersListener>) {}

    set(point: Point, text: string) {
        this.point = point;
        this.text = text;
        this.raiseShow();
    }
    reset() {
        if(this.point !== undefined) {
            this.point = undefined;
            this.text = undefined;
            this.raiseHide();
        }
    }

    protected raiseShow() {
        this.dispatcher.raise1(l => l.notifyResizeInfoShow(this.point, this.text));
    }
    protected raiseHide() {
        this.dispatcher.raise1(l => l.notifyResizeInfoHide());
    }
}
