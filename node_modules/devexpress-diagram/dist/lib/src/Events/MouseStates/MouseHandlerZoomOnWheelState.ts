import { MouseHandlerStateBase } from "./MouseHandlerStateBase";
import { DiagramWheelEvent, DiagramMouseEvent, DiagramEvent, MouseEventElementType } from "../Event";
import { MouseHandler } from "../MouseHandler";
import { IViewController } from "../../ViewController";
import { DiagramSettings, AutoZoomMode } from "../../Settings";

export class MouseHandlerZoomOnWheelState extends MouseHandlerStateBase {
    constructor(handler: MouseHandler, protected settings: DiagramSettings, protected view: IViewController) {
        super(handler);
    }
    onMouseWheel(evt: DiagramWheelEvent): boolean {
        if(!this.trySwitchToDefault(evt)) {
            this.settings.zoomLevel = this.view.getNextStepZoom(evt.deltaY < 0);
            if(evt.source.type === MouseEventElementType.Background)
                this.view.resetScroll();
            else {
                this.view.scrollTo(evt.modelPoint, evt.offsetPoint);
                this.view.normalize();
            }
            evt.preventDefault = true;
            return true;
        }
        else
            return this.handler.state.onMouseWheel(evt);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        this.handler.switchToDefaultState();
        this.handler.state.onMouseUp(evt);
    }
    onMouseDown(evt: DiagramMouseEvent) {
        this.handler.switchToDefaultState();
        this.handler.state.onMouseDown(evt);
    }
    onMouseMove(evt: DiagramMouseEvent) {
        this.trySwitchToDefault(evt) && this.handler.state.onMouseMove(evt);
    }
    trySwitchToDefault(evt: DiagramEvent): boolean {
        if(this.handler.canFinishZoomOnWheel(evt)) {
            this.handler.switchToDefaultState();
            return true;
        }
        return false;
    }
    start() {
        super.start();
        this.settings.zoomLevel = this.view.getZoom();
        this.settings.autoZoom = AutoZoomMode.Disabled;
    }
}
