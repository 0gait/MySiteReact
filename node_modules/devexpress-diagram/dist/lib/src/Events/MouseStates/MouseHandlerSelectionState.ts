import { DiagramMouseEvent, MouseButton } from "../Event";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Selection } from "../../Selection/Selection";
import { MouseHandler } from "../MouseHandler";
import { MouseHandlerCancellableState } from "./MouseHandlerStateBase";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";

export class MouseHandlerSelectionState extends MouseHandlerCancellableState {
    startPoint: Point;
    rectangle: Rectangle;

    constructor(handler: MouseHandler,
        protected selection: Selection,
        protected visualizerManager: IVisualizerManager) {
        super(handler);
    }
    finish() {
        this.handler.raiseDragEnd([]);

        this.visualizerManager.resetSelectionRectangle();
        super.finish();
    }
    cancelChanges() {
    }
    onMouseDown(evt: DiagramMouseEvent) {
        this.startPoint = evt.modelPoint;
        this.handler.raiseDragStart([]);
    }
    onMouseMove(evt: DiagramMouseEvent) {
        if(evt.button !== MouseButton.Left)
            this.handler.switchToDefaultState();

        else {
            this.rectangle = Rectangle.fromPoints(this.startPoint, evt.modelPoint);
            this.visualizerManager.setSelectionRectangle(this.rectangle);
        }
    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(this.rectangle !== undefined)
            this.selection.selectRect(this.rectangle);
        else
            this.selection.set([]);
        this.rectangle = undefined;

        this.handler.switchToDefaultState();
    }
}
