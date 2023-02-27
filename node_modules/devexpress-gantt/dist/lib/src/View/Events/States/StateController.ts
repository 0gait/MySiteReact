import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { TaskEditController } from "../../Edit/TaskEditController";
import { TaskAreaEventSource } from "../../Helpers/Enums";
import { ITaskAreaEventsListener } from "../TaskAreaEventsListener";
import { TaskAreaDefaultState } from "./TaskAreaDefaultState";
import { TaskAreaDependencyState } from "./TaskAreaDependencyState";
import { TaskAreaDomHelper } from "./TaskAreaDomHelper";
import { TaskAreaScrollState } from "./TaskAreaScrollState";
import { TaskAreaStateBase } from "./TaskAreaStateBase";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";
import { TaskAreaZoomState } from "./TaskAreaZoomState";
import { TaskEditState } from "./TaskEditState";
import { TaskMoveState } from "./TaskMoveState";

export class TaskAreaStateController {
    private _state: TaskAreaStateBase;

    private _listener: ITaskAreaEventsListener;
    private _taskArea: HTMLElement;
    private _cellSize: Size;

    protected position: Point = new Point(-1, -1);

    private _pointers:Record<string, any> = { };

    constructor(listener: ITaskAreaEventsListener, taskArea: HTMLElement, cellSize: Size) {
        this._listener = listener;
        this._listener.setHandler(TaskAreaStateEventNames.STATE_EXIT, () => { this.switchToDefaultState(); });
        this._listener.setHandler(TaskAreaStateEventNames.GET_POINTERS_INFO, (args) => { return this.getPointersInfo(args.triggerEvent as PointerEvent); });

        this._taskArea = taskArea;
        this._cellSize = cellSize;

        this.switchToDefaultState();
    }
    public onKeyDown(evt: KeyboardEvent): void { this._state.onKeyDown(evt); }
    public onScroll(evt: Event): void { this._state.onScroll(evt); }
    public onContextMenu(evt: MouseEvent): void { this._state.onContextMenu(evt); }
    public onMouseWheel(evt: WheelEvent): void {
        if(evt.ctrlKey) {
            evt.preventDefault();
            evt.stopPropagation();
            this.switchState(TaskAreaZoomState);
        }
        this._state.onMouseWheel(evt);
    }
    protected get currentState(): TaskAreaStateBase {
        return this._state;
    }

    public onTaskPointerEnter(evt: PointerEvent): void { this._state.onTaskPointerEnter(evt); }
    public onTaskAreaPointerLeave(evt: PointerEvent): void { this._state.onTaskAreaLeave(evt); }
    public onDocumentPointerCancel(evt: PointerEvent): void { this._clearPointerInfo(evt); }
    public onDocumentPointerDown(evt: PointerEvent): void {
        this._updatePinterInfo(evt);
        this.toggleStateOnPointerDown(evt);
        this._state.onDocumentPointerDown(evt);
    }
    public onDocumentPointerMove(evt: PointerEvent): void {
        this._updatePinterInfo(evt);
        this.toggleStateOnPointerMove(evt);
        this._state.onDocumentPointerMove(evt);
    }
    public onDocumentPointerUp(evt: PointerEvent): void {
        this._clearPointerInfo(evt);
        this._state.onDocumentPointerUp(evt);
    }
    public onTaskTouchStart(evt: TouchEvent): void { this._state.onTaskTouchStart(evt); }
    public onTouchStart(evt: TouchEvent): void {
        this.toggleStateOnPointerDown(evt);
        this._state.onTouchStart(evt);
    }
    public onTouchEnd(evt: TouchEvent): void {
        this._state.onTouchEnd(evt);
    }
    public onTouchMove(evt: TouchEvent): void {
        this.toggleStateOnPointerMove(evt);
        this._state.onTouchMove(evt);
    }
    public onClick(evt: Event): void { this._state.onClick(evt); }
    public onDblClick(evt: Event): void { this._state.onDblClick(evt); }
    public onTaskAreaMouseLeave(evt: MouseEvent): void { this._state.onTaskAreaLeave(evt); }
    public onTaskElementHover(evt: MouseEvent | TouchEvent): void { this._state.onTaskHover(evt); }
    public onTaskElementLeave(evt: MouseEvent): void { this._state.onTaskLeave(evt); }
    public onMouseUp(evt: MouseEvent): void { this._state.onMouseUp(evt); }
    public onMouseMove(evt: MouseEvent): void { this._state.onMouseMove(evt); }

    onMouseDown(evt: MouseEvent): void {
        const source = this.getTaskAreaEventSource(evt);
        switch(source) {
            case TaskAreaEventSource.TaskArea:
                this.processMouseDownOnTaskArea(evt);
                break;
            case TaskAreaEventSource.TaskEdit_Frame:
                this.switchState(TaskMoveState);
                break;
            case TaskAreaEventSource.TaskEdit_Progress:
            case TaskAreaEventSource.TaskEdit_Start:
            case TaskAreaEventSource.TaskEdit_End:
                this.switchState(TaskEditState);
                break;
            case TaskAreaEventSource.TaskEdit_DependencyStart:
            case TaskAreaEventSource.TaskEdit_DependencyFinish:
                this.switchState(TaskAreaDependencyState);
                break;
        }
        this._state.onMouseDown(evt);
    }

    protected get taskArea(): HTMLElement {
        return this._taskArea;
    }
    protected switchToDefaultState(): void {
        this._state = new TaskAreaDefaultState(this._listener, this.taskArea, this._cellSize);
    }
    protected switchState<T extends TaskAreaStateBase>(type: { new (listener: ITaskAreaEventsListener, taskArea: HTMLElement, cellSize: Size): T }): void {
        if(this._state instanceof type)
            return;
        if(this._state)
            this._state.finish();
        this._state = new type(this._listener, this.taskArea, this._cellSize);
        this._state.start();
    }
    protected processMouseDownOnTaskArea(evt: MouseEvent): void {
        if(EvtUtils.isLeftButtonPressed(evt) && !TaskAreaDomHelper.isConnectorLine(evt))
            this.switchState(TaskAreaScrollState);
    }
    protected toggleStateOnPointerDown(evt: PointerEvent | TouchEvent): void {
        const touchProcessed = this.toggleStateWhenMultiOrOutsideTouch(evt);
        this.position = new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));
        if(!touchProcessed && this._canStartDrag(evt)) {
            const source = this.getTaskAreaEventSource(evt);
            switch(source) {
                case TaskAreaEventSource.TaskEdit_DependencyStart:
                case TaskAreaEventSource.TaskEdit_DependencyFinish:
                    this.switchState(TaskAreaDependencyState);
                    break;
                case TaskAreaEventSource.TaskEdit_Progress:
                case TaskAreaEventSource.TaskEdit_Start:
                case TaskAreaEventSource.TaskEdit_End:
                    this.switchState(TaskEditState);
                    break;
            }
        }
    }
    protected toggleStateOnPointerMove(evt: PointerEvent | TouchEvent): void {
        const touchProcessed = this.toggleStateWhenMultiOrOutsideTouch(evt);
        const isMove = Math.abs(this.position.x - EvtUtils.getEventX(evt)) > 1 || Math.abs(this.position.y - EvtUtils.getEventY(evt)) > 1;
        if(!touchProcessed && isMove && this._canStartDrag(evt) && this._state instanceof TaskAreaDefaultState)
            switch(this.getTaskAreaEventSource(evt)) {
                case TaskAreaEventSource.TaskArea:
                    if(this.checkEventInTaskEditFrameArea(evt))
                        this.switchState(TaskMoveState);
                    else
                        this.switchState(TaskAreaScrollState);
                    break;
                case TaskAreaEventSource.TaskEdit_Frame:
                    if(!this.isTaskUpdateDisabled())
                        this.switchState(TaskMoveState);
                    else
                        this.switchState(TaskAreaScrollState);
                    break;
                case TaskAreaEventSource.TaskEdit_Progress:
                case TaskAreaEventSource.TaskEdit_Start:
                case TaskAreaEventSource.TaskEdit_End:
                    this.switchState(TaskEditState);
                    break;
            }
    }
    protected toggleStateWhenMultiOrOutsideTouch(evt: PointerEvent | TouchEvent): boolean {
        const touchCount = this._getActivePointersCount(evt);
        const isOutside = !this.isInTaskArea(evt);
        const processed = touchCount >= 2 || isOutside;
        if(touchCount > 2 || isOutside)
            this.switchState(TaskAreaDefaultState);
        else if(touchCount === 2)
            this.switchState(TaskAreaZoomState);
        return processed;
    }
    private checkEventInTaskEditFrameArea(evt: MouseEvent | TouchEvent): boolean {
        const frame = this.getTaskEditFrameElement();
        if(this.isTaskUpdateDisabled() || !frame)
            return false;

        const eventX = (evt as MouseEvent)?.clientX || (evt as TouchEvent)?.touches[0]?.clientX;
        const eventY = (evt as MouseEvent)?.clientY || (evt as TouchEvent)?.touches[0]?.clientY;
        const rect = frame.getBoundingClientRect();
        return eventX >= rect.left && eventX <= rect.left + rect.width && eventY >= rect.top && eventY <= rect.top + rect.height;
    }
    private isTaskUpdateDisabled(): boolean {
        return this._taskArea.getAttribute("task-edit-enabled") === "false";
    }
    protected isInTaskArea(evt: Event): boolean {
        return DomUtils.isItParent(this._taskArea, EvtUtils.getEventSource(evt));
    }
    private getTaskEditFrameElement(): Element {
        return this._taskArea.getElementsByClassName(TaskEditController.CLASSNAMES.TASK_EDIT_FRAME)[0];
    }
    private _updatePinterInfo(evt: PointerEvent) {
        const key = evt.pointerId;
        this._pointers[key] = {
            pageX: evt.pageX,
            pageY: evt.pageY,
            pointerType: evt.pointerType
        };
    }
    private _clearPointerInfo(evt: PointerEvent) {
        const key = evt.pointerId;
        delete this._pointers[key];
    }
    public isTouchEvent(evt: Event): boolean { return TaskAreaDomHelper.isTouchEvent(evt); }
    public isPointerEvent(evt: Event): boolean { return TaskAreaDomHelper.isPointerEvent(evt); }
    private _getActivePointersCount(evt: PointerEvent | TouchEvent): number {
        if(this.isTouchEvent(evt))
            return (evt as TouchEvent).touches.length;
        return Object.keys(this._pointers).filter(p => this._pointers[p].pointerType === (evt as PointerEvent).pointerType).length;
    }
    private getPointersInfo(evt: PointerEvent): Array<Record<string, any>> {
        const pointerType = evt?.pointerType;
        let pointers = Object.keys(this._pointers).map(k => this._pointers[k]);
        if(pointerType)
            pointers = pointers.filter(p => p.pointerType === pointerType);
        return pointers;
    }
    private _canStartDrag(evt: PointerEvent | TouchEvent): boolean {
        if(this._getActivePointersCount(evt) > 1)
            return false;
        const isMouse = TaskAreaDomHelper.isMousePointer(evt);
        if(isMouse && (evt as PointerEvent).buttons !== 1)
            return false;
        if(TaskAreaDomHelper.isConnectorLine(evt))
            return false;

        return true;
    }
    private getTaskAreaEventSource(evt: Event): TaskAreaEventSource {
        return TaskAreaDomHelper.getEventSource(EvtUtils.getEventSource(evt));
    }
}
