import { Point } from "@devexpress/utils/lib/geometry/point";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { TaskAreaStateBase } from "./TaskAreaStateBase";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";

export abstract class TaskDragBaseState extends TaskAreaStateBase {
    currentPosition: Point;

    protected onMouseDownInternal(evt: MouseEvent): void { this.onStart(evt); }
    public onMouseUp(evt: MouseEvent): void { this.onEnd(evt); }
    protected onMouseMoveInternal(evt: MouseEvent): void { this.onDrag(evt); }

    protected onTouchStartInternal(evt: TouchEvent): void { this.onStart(evt); }
    protected onTouchEndInternal(evt: TouchEvent): void { this.onEnd(evt); }
    protected onTouchMoveInternal(evt: TouchEvent): void { this.onDrag(evt); }

    protected onDocumentPointerDownInternal(evt: PointerEvent): void { this.onStart(evt); }
    protected onDocumentPointerUpInternal(evt: PointerEvent): void { this.onEnd(evt); }
    protected onDocumentPointerMoveInternal(evt: PointerEvent): void { this.onDrag(evt); }


    private onStart(evt: MouseEvent | TouchEvent): void {
        this.currentPosition = new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));
        this.raiseDependencySelection(evt, null);
        this.onStartInternal(evt);
    }
    private onDrag(evt: MouseEvent | TouchEvent): void {
        evt.preventDefault();
        const position = new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));
        this.currentPosition ??= position;
        this.onDragInternal(position);
        this.currentPosition = position;
    }
    private onEnd(evt: MouseEvent | TouchEvent): void {
        this.onEndInternal(evt);
        this.raiseEvent(TaskAreaStateEventNames.STATE_EXIT, evt);
    }
    protected onStartInternal(_evt: MouseEvent | TouchEvent): void { }
    protected onEndInternal(_evt: MouseEvent | TouchEvent): void { }
    protected onDragInternal(_position: Point): void { }

    public finish(): void {
        this.raiseEvent(TaskAreaStateEventNames.TASK_EDIT_END);
    }
}
