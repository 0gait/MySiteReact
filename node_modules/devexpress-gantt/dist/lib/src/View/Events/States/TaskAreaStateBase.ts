import { Browser } from "@devexpress/utils/lib/browser";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { KeyUtils, ModifierKey } from "@devexpress/utils/lib/utils/key";
import { TaskAreaEventArgs } from "../TaskAreaEventArgs";
import { ITaskAreaEventsListener } from "../TaskAreaEventsListener";
import { TaskAreaDomHelper } from "./TaskAreaDomHelper";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";

export abstract class TaskAreaStateBase {

    private _listener: ITaskAreaEventsListener;
    private _taskArea: HTMLElement;
    private _cellSize: Size;

    protected position: Point = new Point(-1, -1);
    protected isCursorInArea: boolean = false;

    constructor(listener: ITaskAreaEventsListener, taskArea: HTMLElement, cellSize: Size) {
        this._listener = listener;
        this._taskArea = taskArea;
        this._cellSize = cellSize;
    }
    public start(): void { }
    public finish(): void { }

    public isTouchEvent(evt: Event): boolean { return TaskAreaDomHelper.isTouchEvent(evt); }
    public isPointerEvent(evt: Event): boolean { return TaskAreaDomHelper.isPointerEvent(evt); }
    public isMouseEvent(evt: Event): boolean { return TaskAreaDomHelper.isMouseEvent(evt); }

    public onMouseWheel(evt: WheelEvent): void { }
    public onScroll(evt: Event): void { this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_SCROLL); }
    public onKeyDown(evt: KeyboardEvent): void {
        if(this.isCursorInArea)
            this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_KEY_DOWN, evt, null, { code: this.getShortcutCode(evt) });
    }
    public onContextMenu(evt: MouseEvent): void {
        const rowIndex = this.getClickedRowIndex(evt);
        const isDependency = TaskAreaDomHelper.isConnectorLine(evt);
        if(!isDependency)
            this.raiseTaskSelection(evt, rowIndex);

        evt.stopPropagation();
        evt.preventDefault();
        if(Browser.WebKitFamily)
            evt.returnValue = false;
        this.raiseEvent(TaskAreaStateEventNames.CONTEXTMENU_SHOW, evt, rowIndex, { type: isDependency ? "dependency" : "task" });
    }
    public onTaskPointerEnter(evt: PointerEvent): void { this.onTaskPointerEnterBase(evt); }
    public onDocumentPointerMove(evt: PointerEvent): void { this.processPointerMove(evt); }
    public onDocumentPointerDown(evt: PointerEvent): void { this.processPointerDown(evt); }
    public onDocumentPointerUp(evt: PointerEvent): void { this.processPointerUp(evt); }
    public onTaskTouchStart(evt: TouchEvent): void { this.onTaskPointerEnterBase(evt); }
    public onTouchMove(evt: TouchEvent): void { this.processPointerMove(evt); }
    public onTouchStart(evt: TouchEvent): void { this.processPointerDown(evt); }
    public onTouchEnd(evt: TouchEvent): void { this.processPointerUp(evt); }
    public onMouseDown(evt: MouseEvent): void { this.processPointerDown(evt); }
    public onMouseUp(evt: MouseEvent): void { }
    public onMouseMove(evt: MouseEvent): void { this.processPointerMove(evt); }
    public onTaskHover(evt: MouseEvent | TouchEvent): void { this.onTaskPointerEnterBase(evt); }
    public onTaskLeave(evt: MouseEvent): void { this.raiseEvent(TaskAreaStateEventNames.TASK_LEAVE, evt, this.getClickedRowIndex(evt)); }
    public onClick(evt: Event): void {
        const rowIndex = this.getClickedRowIndex(evt);
        this.raiseTaskSelection(evt, rowIndex);
        this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_CLICK, evt, rowIndex);
    }
    public onDblClick(evt: Event): void {
        evt.preventDefault();
        this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_DBLCLICK, evt, this.getClickedRowIndex(evt));
    }
    public onTaskAreaLeave(evt: MouseEvent): void {
        const isMouseLeave = this.isPointerEvent(evt) ? TaskAreaDomHelper.isMousePointer(evt) : true;
        if(isMouseLeave) {
            this.isCursorInArea = false;
            this.raiseEvent(TaskAreaStateEventNames.TASK_EDIT_END, evt);
        }
        this.onTaskAreaLeaveInternal(evt);
    }

    protected onTaskPointerEnterBase(evt: MouseEvent | TouchEvent | PointerEvent): void {
        if(!this.isTouchEvent(evt) && !this.isPointerEvent(evt))
            evt.preventDefault();
        this.raiseEvent(TaskAreaStateEventNames.TASK_EDIT_START, evt, this.getClickedRowIndex(evt));
    }

    protected processPointerDown(evt: MouseEvent | TouchEvent | PointerEvent): void {
        const isTouchEvent = this.isTouchEvent(evt);
        const isPointerEvent = this.isPointerEvent(evt);
        const isOutsideTouch = (isTouchEvent || isPointerEvent) && this.checkAndProcessTouchOutsideArea(evt);
        if(isOutsideTouch) return;

        this.position = new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));

        if(isTouchEvent || isPointerEvent)
            evt.preventDefault();
        if(isTouchEvent)
            this.onTouchStartInternal(<TouchEvent>evt);
        else if(isPointerEvent)
            this.onDocumentPointerDownInternal(<PointerEvent>evt);
        else
            this.onMouseDownInternal(<MouseEvent>evt);
    }
    protected processPointerMove(evt: MouseEvent | TouchEvent | PointerEvent): void {
        const isTouchEvent = this.isTouchEvent(evt);
        const isPointerEvent = this.isPointerEvent(evt);
        this.position ??= new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));
        const isMove = Math.abs(this.position.x - EvtUtils.getEventX(evt)) > 2 || Math.abs(this.position.y - EvtUtils.getEventY(evt)) > 2;
        const isOutsideTouch = (isTouchEvent || isPointerEvent) && this.checkAndProcessTouchOutsideArea(evt);
        if(isOutsideTouch || !isMove) return;

        if(isTouchEvent || isPointerEvent)
            evt.preventDefault();

        if(this.isTouchEvent(evt))
            this.onTouchMoveInternal(evt as TouchEvent);
        else if(this.isPointerEvent(evt))
            this.onDocumentPointerMoveInternal(evt as PointerEvent);
        else {
            this.isCursorInArea = true;
            this.onMouseMoveInternal(evt as MouseEvent);
        }
    }
    protected processPointerUp(evt: TouchEvent | PointerEvent): void {
        if(!this.checkAndProcessTouchOutsideArea(evt)) {
            evt.preventDefault();
            if(this.isTouchEvent(evt))
                this.onTouchEndInternal(evt as TouchEvent);
            else
                this.onDocumentPointerUpInternal(evt as PointerEvent);
        }
    }

    protected onMouseDownInternal(evt: MouseEvent): void { }
    protected onMouseMoveInternal(evt: MouseEvent): void { }

    protected onDocumentPointerUpInternal(evt: PointerEvent): void { }
    protected onDocumentPointerDownInternal(evt: PointerEvent): void { }
    protected onDocumentPointerMoveInternal(evt: PointerEvent): void { }

    protected onTouchStartInternal(evt: TouchEvent): void { }
    protected onTouchEndInternal(evt: TouchEvent): void { }
    protected onTouchMoveInternal(evt: TouchEvent): void { }

    protected onTaskAreaLeaveInternal(evt: MouseEvent) : void { }

    protected checkAndProcessTouchOutsideArea(evt: Event): boolean {
        const isOutside = !this.isInTaskArea(evt);
        if(isOutside)
            this.raiseEvent(TaskAreaStateEventNames.TASK_EDIT_END, evt);
        this.isCursorInArea = !isOutside;
        return isOutside;
    }

    protected raiseEvent(eventKey: string, domEvent?: Event, rowIndex?: number, data?: Record<string, any>): any {
        const args = new TaskAreaEventArgs(eventKey, domEvent, rowIndex, data);
        const handler = this._listener.getHandler(eventKey);
        return handler && handler(args);
    }
    protected raiseDependencySelection(evt: Event, key: string): void {
        this.raiseEvent(TaskAreaStateEventNames.DEPENDENCY_SELECTION, evt, null, { key: key });
    }
    protected raiseTaskSelection(evt: Event, index: number): void {
        const isFocus = DomUtils.isItParent(this._taskArea, EvtUtils.getEventSource(evt));
        if(isFocus && !TaskAreaDomHelper.isConnectorLine(evt))
            this.raiseEvent(TaskAreaStateEventNames.TASK_SELECTION, evt, index);
    }
    protected getClickedRowIndex(evt: any): number {
        if(!evt)
            return -1;
        const y = EvtUtils.getEventY(evt);
        const taskAreaY = DomUtils.getAbsolutePositionY(this._taskArea);
        const relativeY = y - taskAreaY;
        return Math.floor(relativeY / this._cellSize.height);
    }
    protected getRelativePos(absolutePos: Point): Point {
        const taskAreaX = DomUtils.getAbsolutePositionX(this._taskArea);
        const taskAreaY = DomUtils.getAbsolutePositionY(this._taskArea);
        return new Point(absolutePos.x - taskAreaX, absolutePos.y - taskAreaY);
    }
    protected isInTaskArea(evt: Event): boolean {
        return DomUtils.isItParent(this._taskArea, EvtUtils.getEventSource(evt));
    }

    private getShortcutCode(evt: KeyboardEvent): number {
        const keyCode = KeyUtils.getEventKeyCode(evt);
        let modifiers = 0;
        if(evt.altKey)
            modifiers |= ModifierKey.Alt;
        if(evt.ctrlKey)
            modifiers |= ModifierKey.Ctrl;
        if(evt.shiftKey)
            modifiers |= ModifierKey.Shift;
        if(evt.metaKey && Browser.MacOSPlatform)
            modifiers |= ModifierKey.Meta;
        return modifiers | keyCode;
    }
}

