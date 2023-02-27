import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { EventDispatcher } from "../../Utils";
import { IVisualizersListener } from "../EventManager";
import { TargetVisualizerBase } from "./TargetVisualizerBase";

export class ContainerTargetInfo {
    constructor(public rect: Rectangle, public strokeWidth: number) {
    }
}

export class ContainerTargetVisualizer extends TargetVisualizerBase {
    constructor(dispatcher: EventDispatcher<IVisualizersListener>) {
        super(dispatcher);
    }

    raiseShow() {
        const info = new ContainerTargetInfo(this.targetRect, this.targetStrokeWidth);
        this.dispatcher.raise1(l => l.notifyContainerTargetShow(this.key, info));
    }
    raiseHide() {
        this.dispatcher.raise1(l => l.notifyContainerTargetHide());
    }
}
