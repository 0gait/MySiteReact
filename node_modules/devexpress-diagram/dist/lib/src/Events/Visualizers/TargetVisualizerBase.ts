import { EventDispatcher } from "../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { IVisualizersListener } from "../EventManager";
import { ItemKey } from "../../Model/DiagramItem";

export abstract class TargetVisualizerBase {
    protected key: ItemKey;
    protected targetRect: Rectangle;
    protected targetStrokeWidth: number;

    constructor(protected dispatcher: EventDispatcher<IVisualizersListener>) {}

    getKey() {
        return this.key;
    }
    setTargetRect(key: ItemKey, targetRect: Rectangle, targetStrokeWidth: number) {
        if(this.key !== key) {
            this.key = key;
            this.targetRect = targetRect;
            this.targetStrokeWidth = targetStrokeWidth;
            this.raiseShow();
        }
    }
    reset() {
        if(this.key !== "-1") {
            this.key = "-1";
            this.targetRect = undefined;
            this.targetStrokeWidth = 0;
            this.raiseHide();
        }
    }
    abstract raiseShow();
    abstract raiseHide();
}
