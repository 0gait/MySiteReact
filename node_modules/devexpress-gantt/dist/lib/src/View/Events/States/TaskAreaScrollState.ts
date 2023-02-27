import { TaskAreaStateBase } from "./TaskAreaStateBase";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";

export class TaskAreaScrollState extends TaskAreaStateBase {
    private _isStarted: boolean = false;

    public finish(): void { this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_END_MOVE, null); }

    public onMouseUp(evt: MouseEvent): void { this.onEnd(evt); }
    protected onMouseDownInternal(evt: MouseEvent): void { this.onBeforeStart(evt); }
    protected onMouseMoveInternal(evt: MouseEvent): void { this.onMove(evt); }

    protected onDocumentPointerUpInternal(evt: PointerEvent): void { this.onEnd(evt); }
    protected onDocumentPointerMoveInternal(evt: PointerEvent): void { this.onMoveByPointer(evt); }

    protected onTouchEndInternal(evt: TouchEvent): void { this.onEnd(evt); }
    protected onTouchMoveInternal(evt: TouchEvent): void { this.onMoveByPointer(evt); }

    protected onBeforeStart(evt: TouchEvent | MouseEvent): void {
        evt.preventDefault();
        this.raiseDependencySelection(evt, null);
        this.raiseEvent(TaskAreaStateEventNames.TASK_EDIT_END, evt);
        this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_START_MOVE, evt);
        this._isStarted = true;
    }
    protected onMoveByPointer(evt: TouchEvent | MouseEvent): void {
        if(!this._isStarted)
            this.onBeforeStart(evt);
        else
            this.onMove(evt);
    }
    protected onMove(evt: TouchEvent | MouseEvent): void {
        evt.preventDefault();
        this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_PROCESS_MOVE, evt);
    }
    protected onEnd(evt: TouchEvent | MouseEvent): void {
        evt.preventDefault();
        this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_END_MOVE, evt);
        this.raiseEvent(TaskAreaStateEventNames.STATE_EXIT, evt);
        this._isStarted = false;
    }
}
