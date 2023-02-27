import { MouseHandler } from "../MouseHandler";
import { DiagramMouseEvent, DiagramWheelEvent, DiagramKeyboardEvent } from "../Event";
import { DiagramDraggingEvent } from "../../Render/Toolbox/Toolbox";
import { KeyCode } from "@devexpress/utils/lib/utils/key";
import { ConnectionPointInfo } from "../Visualizers/ConnectionPointsVisualizer";
import { ConnectionTargetInfo } from "../Visualizers/ConnectionTargetVisualizer";

export class MouseHandlerStateBase {
    start() { }
    finish() { }
    handler: MouseHandler;

    constructor(handler: MouseHandler) {
        this.handler = handler;
    }

    onMouseClick(_evt: DiagramMouseEvent) { }
    onMouseDblClick(_evt: DiagramMouseEvent) {
        this.handler.switchToDefaultState();
    }
    onMouseDown(_evt: DiagramMouseEvent) { }
    onMouseUp(_evt: DiagramMouseEvent) { }
    onMouseMove(_evt: DiagramMouseEvent) { }
    onMouseWheel(_evt: DiagramWheelEvent): boolean { return false; }
    onDragStart(_evt: DiagramDraggingEvent) { }
    onDragEnd(_evt: DiagramMouseEvent) { }
    onShortcut(_shortcutCode: number): boolean { return false; }
    onKeyDown(_evt: DiagramKeyboardEvent): void { }
    onKeyUp(_evt: DiagramKeyboardEvent): void { }

    onConnectionPointsShow(key: string, points: ConnectionPointInfo[]): void {}
    onConnectionTargetShow(key: string, info: ConnectionTargetInfo): void {}
}

export abstract class MouseHandlerCancellableState extends MouseHandlerStateBase {
    onShortcut(code: number): boolean {
        if(code === KeyCode.Esc) {
            this.cancelChanges();
            this.handler.switchToDefaultState();
            return true;
        }
        return false;
    }
    abstract cancelChanges();
}
