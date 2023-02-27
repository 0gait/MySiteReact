import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { EventDispatcher } from "../../Utils";
import { IVisualizersListener } from "../EventManager";
import { TargetVisualizerBase } from "./TargetVisualizerBase";

export class ConnectionTargetInfo {
    public allowed: boolean = true;
    constructor(public rect: Rectangle, public strokeWidth: number) {
    }
}

export class ConnectionTargetVisualizer extends TargetVisualizerBase {
    constructor(dispatcher: EventDispatcher<IVisualizersListener>) {
        super(dispatcher);
    }

    raiseShow() {
        const info = new ConnectionTargetInfo(this.targetRect, this.targetStrokeWidth);
        this.dispatcher.raise1(l => l.notifyConnectionTargetShow(this.key, info));
    }
    raiseHide() {
        this.dispatcher.raise1(l => l.notifyConnectionTargetHide());
    }
}
