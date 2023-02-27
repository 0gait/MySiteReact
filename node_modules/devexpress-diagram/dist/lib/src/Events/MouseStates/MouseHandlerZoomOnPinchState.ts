import { MouseHandler } from "../MouseHandler";
import { IViewController } from "../../ViewController";
import { DiagramMouseEvent, DiagramMouseEventTouch } from "../Event";
import { AutoZoomMode, DiagramSettings } from "../../Settings";
import { Selection } from "../../Selection/Selection";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { MouseHandlerScrollingState } from "./MouseHandlerScrollingState";
import { Metrics } from "@devexpress/utils/lib/geometry/metrics";

const PINCH_CHANGE_DISTANCE = 1;

export class MouseHandlerZoomOnPinchState extends MouseHandlerScrollingState {
    private startDistance: number;
    private prevDistance: number;
    private startZoomLevel: number;

    constructor(handler: MouseHandler, protected selection: Selection, protected settings: DiagramSettings, protected view: IViewController) {
        super(handler, view, selection);
    }

    onMouseDown(evt: DiagramMouseEvent) {
        super.onMouseDown(evt);

        if(evt.touches.length > 1) {
            this.startDistance = this.getTouchDistance(evt);
            this.startZoomLevel = this.settings.zoomLevel;
            this.prevDistance = this.startDistance;
        }
    }
    onMouseMove(evt: DiagramMouseEvent) {
        if(evt.touches.length > 1) {
            const distance = this.getTouchDistance(evt);
            if(Math.abs(this.prevDistance - distance) > PINCH_CHANGE_DISTANCE) {
                this.settings.zoomLevel = this.startZoomLevel * (distance / this.startDistance);
                this.view.scrollTo(this.getMiddleLayoutPoint(evt), this.getMiddleAbsPoint(evt));
                this.view.normalize();

                this.prevDistance = distance;
            }
        }
        super.onMouseMove(evt);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(evt.touches.length === 0)
            setTimeout(function() {
                this.handler.switchToDefaultState();
            }.bind(this), 1);

    }
    start() {
        super.start();

        this.settings.zoomLevel = this.view.getZoom();
        this.settings.autoZoom = AutoZoomMode.Disabled;
    }
    private getTouchDistance(evt: DiagramMouseEvent) {
        const pt0 = new Point(evt.touches[0].offsetPoint.x, evt.touches[0].offsetPoint.y);
        const pt1 = new Point(evt.touches[1].offsetPoint.x, evt.touches[1].offsetPoint.y);
        return Metrics.euclideanDistance(pt0, pt1);
    }
    protected getPointByEvent(evt: DiagramMouseEvent): Point {
        return this.getMiddleAbsPoint(evt);
    }
    private getMiddleAbsPoint(evt: DiagramMouseEvent): Point {
        if(evt.touches.length > 1)
            return MouseHandlerZoomOnPinchState.getMiddlePointByEvent(evt, touch => touch.offsetPoint);
        return evt.offsetPoint;
    }
    private getMiddleLayoutPoint(evt: DiagramMouseEvent): Point {
        if(evt.touches.length > 1)
            return MouseHandlerZoomOnPinchState.getMiddlePointByEvent(evt, touch => touch.modelPoint);
        return evt.modelPoint;
    }
    private static getMiddlePointByEvent(evt: DiagramMouseEvent, getPoint: (touch: DiagramMouseEventTouch) => Point): Point {
        if(evt.touches.length > 1)
            return new Point(
                (getPoint(evt.touches[0]).x + getPoint(evt.touches[1]).x) / 2,
                (getPoint(evt.touches[0]).y + getPoint(evt.touches[1]).y) / 2,
            );

    }
}
