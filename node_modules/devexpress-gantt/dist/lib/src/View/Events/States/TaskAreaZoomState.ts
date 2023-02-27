import { Point } from "@devexpress/utils/lib/geometry/point";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { Metrics } from "@devexpress/utils/lib/geometry/metrics";
import { TaskAreaStateBase } from "./TaskAreaStateBase";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";

const PINCH_CHANGE_DISTANCE = 3;

const MOUSE_ZOOM_LOCK_TIMEOUT = 50;
const TOUCH_ZOOM_LOCK_TIMEOUT = 1000;

export class TaskAreaZoomState extends TaskAreaStateBase {
    private _isInZooming = false;
    private prevDistance: number;

    public onMouseWheel(evt: WheelEvent): void {
        if(evt.ctrlKey) {
            evt.preventDefault();
            evt.stopPropagation();
            if(!this._isInZooming)
                this.processZoom(evt, EvtUtils.getWheelDelta(evt) > 0, MOUSE_ZOOM_LOCK_TIMEOUT);
        }
    }

    protected onDocumentPointerUpInternal(evt: PointerEvent): void { this.onEndZoom(evt); }
    protected onDocumentPointerMoveInternal(evt: PointerEvent): void { this.onTouchZoom(evt); }

    protected onTouchEndInternal(evt: TouchEvent): void { this.onEndZoom(evt); }
    protected onTouchMoveInternal(evt: TouchEvent): void { this.onTouchZoom(evt); }

    protected onTouchZoom(evt: TouchEvent | PointerEvent): void {
        evt.stopPropagation();
        evt.preventDefault();
        if(!this._isInZooming) {
            const distance = this.getTouchDistance(evt);
            this.prevDistance ??= distance;
            const diff = this.prevDistance - distance;
            if(Math.abs(diff) > PINCH_CHANGE_DISTANCE) {
                this.processZoom(evt, diff > 0, TOUCH_ZOOM_LOCK_TIMEOUT);
                this.prevDistance = distance;
            }
        }
    }
    protected processZoom(evt: Event, increase: boolean, lockTimeout: number): void {
        this._isInZooming = true;
        setTimeout(() => { this._isInZooming = false; }, lockTimeout);
        const eventKey = increase ? TaskAreaStateEventNames.TASK_AREA_ZOOM_IN : TaskAreaStateEventNames.TASK_AREA_ZOOM_OUT;
        this.raiseEvent(eventKey, evt, null, { leftPos: this.getLeftPosition(evt) });
    }
    protected onEndZoom(evt: Event): void {
        this.prevDistance = null;
        this.raiseEvent(TaskAreaStateEventNames.STATE_EXIT, evt);
    }
    private getTouchDistance(evt: TouchEvent | PointerEvent) {
        const points = this.GetTouchPoints(evt);
        return this.getDistance(points[0], points[1]);
    }
    private GetTouchPoints(evt: Event): Point[] {
        if(this.isTouchEvent(evt)) {
            const touches = (evt as TouchEvent).touches;
            return [
                new Point(touches[0].pageX, touches[0].pageY),
                new Point(touches[1].pageX, touches[1].pageY)
            ];
        }
        const pointers = this.raiseEvent(TaskAreaStateEventNames.GET_POINTERS_INFO, evt);
        return [
            new Point(pointers[0]?.pageX, pointers[0]?.pageY),
            new Point(pointers[1]?.pageX, pointers[1]?.pageY)
        ];
    }
    private getDistance(a: Point, b: Point): number {
        return Metrics.euclideanDistance(a, b);
    }
    protected getLeftPosition(evt: Event): number {
        let leftPos = 0;
        if(this.isTouchEvent(evt) || this.isPointerEvent(evt))
            leftPos = this.getZoomMiddlePoint(evt).x;
        else if(this.isMouseEvent(evt))
            leftPos = this.getMouseZoomLeftPos(<MouseEvent>evt);
        return leftPos;
    }
    private getMouseZoomLeftPos(evt: MouseEvent): number {
        const ref = this.raiseEvent(TaskAreaStateEventNames.GET_COORDINATES_REF_POINT) as Point;
        return EvtUtils.getEventX(evt) - ref.x;
    }
    private getZoomMiddlePoint(evt: Event): Point {
        const ref = this.raiseEvent(TaskAreaStateEventNames.GET_COORDINATES_REF_POINT) as Point;
        const points = this.GetTouchPoints(evt);
        const point1 = this.convertScreenToChartCoordinates(points[0], ref);
        const point2 = this.convertScreenToChartCoordinates(points[1], ref);
        return new Point(
            (point1.x + point2.x) / 2,
            (point1.y + point2.y) / 2
        );
    }
    private convertScreenToChartCoordinates(p: Point, ref: Point): Point { return new Point(p.x - ref.x, p.y - ref.y); }
}
