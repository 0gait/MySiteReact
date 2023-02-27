import { MouseHandlerCancellableState } from "./MouseHandlerStateBase";
import { MouseHandler } from "../MouseHandler";
import { IViewController } from "../../ViewController";
import { DiagramKeyboardEvent, DiagramMouseEvent, MouseButton } from "../Event";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Selection } from "../../Selection/Selection";

export class MouseHandlerScrollingState extends MouseHandlerCancellableState {
    private startPoint: Point;
    private currentPoint: Point;
    private lastOffset: Point = new Point(0, 0);
    constructor(handler: MouseHandler, protected view: IViewController, protected selection: Selection) {
        super(handler);
    }
    onKeyUp(evt: DiagramKeyboardEvent): void {
        this.handler.onFinishScrollPageByKeyboard(evt);
    }
    onMouseDown(evt: DiagramMouseEvent) {
        evt.preventDefault = true;
        this.startPoint = this.getPointByEvent(evt);
    }
    onMouseMove(evt: DiagramMouseEvent) {
        if(evt.button !== MouseButton.Left) {
            this.handler.onFinishScrollPageByMouse(evt);
            return;
        }
        const prevPoint = this.currentPoint || this.startPoint;
        evt.preventDefault = true;
        const point = this.getPointByEvent(evt);
        const actualOffset = this.view.scrollBy(new Point(point.x - prevPoint.x, point.y - prevPoint.y));
        this.lastOffset = this.lastOffset.clone().offset(actualOffset.x, actualOffset.y);
        this.currentPoint = point;
    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(evt.button === MouseButton.Left)
            this.handler.onFinishScrollPageByMouse(evt);
        this.handler.switchToDefaultState();
    }

    cancelChanges() {
        if(this.currentPoint)
            this.view.scrollBy(this.lastOffset.clone().multiply(-1, -1));
    }
    finish() {
        if(!this.currentPoint || !this.startPoint || this.currentPoint.equals(this.startPoint))
            this.selection.set([]);
        super.finish();
    }
    protected getPointByEvent(evt: DiagramMouseEvent): Point {
        return evt.offsetPoint;
    }
}
