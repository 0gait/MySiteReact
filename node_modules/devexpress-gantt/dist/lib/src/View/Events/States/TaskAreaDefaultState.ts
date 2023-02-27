import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { TaskAreaDomHelper } from "./TaskAreaDomHelper";
import { TaskAreaStateBase } from "./TaskAreaStateBase";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";

export class TaskAreaDefaultState extends TaskAreaStateBase {
    static defaultContextMenuTimeout = 3000;
    static defaultDblClickTimeout = 500;
    static defaultDblClickClearTimeout = TaskAreaDefaultState.defaultDblClickTimeout + 100;

    private _contextMenuTimer: number;
    private _dblClickClearTimer: number;
    private _lastTouchRowIndex: number;
    private _lastEmulatedClickTime: Date;

    public finish():void {
        this.clearTimers();
        this.raiseEvent(TaskAreaStateEventNames.CONTEXTMENU_HIDE);
    }

    protected onMouseDownInternal(evt: MouseEvent): void { this.onPointerDownBase(evt); }

    protected onDocumentPointerDownInternal(evt: PointerEvent): void { this.onPointerDownBase(evt); }
    protected onDocumentPointerUpInternal(evt: PointerEvent): void { this.onPointerUpBase(evt); }
    protected onDocumentPointerMoveInternal(evt: PointerEvent): void { this.clearTimers(); }

    protected onTouchStartInternal(evt: TouchEvent): void { this.onPointerDownBase(evt); }
    protected onTouchEndInternal(evt: TouchEvent): void { this.onPointerUpBase(evt); }
    protected onTouchMoveInternal(evt: TouchEvent): void { this.clearTimers(); }

    protected onPointerDownBase(evt: PointerEvent | TouchEvent | MouseEvent): void {
        evt.preventDefault();
        this._lastTouchRowIndex = this.getClickedRowIndex(evt);

        const isMouse = this.isPointerEvent(evt) ? TaskAreaDomHelper.isMousePointer(evt) : this.isMouseEvent(evt);
        if(isMouse)
            this.changeSelectionOnTouchDown(evt);
        else {
            setTimeout(() =>{
                if(!TaskAreaDomHelper.isMousePointer(evt))
                    this.raiseEvent(TaskAreaStateEventNames.CONTEXTMENU_HIDE, evt);
                this.changeSelectionOnTouchDown(evt);
            }, 0);

            clearTimeout(this._contextMenuTimer);
            this._contextMenuTimer = setTimeout(() => this.showContextMenuOnTouchDown(evt), TaskAreaDefaultState.defaultContextMenuTimeout);
        }
    }
    protected onPointerUpBase(evt: PointerEvent | TouchEvent): void {
        clearTimeout(this._contextMenuTimer);
        evt.preventDefault();
        if(this.canToEmulateClick(evt)) {
            const rowIndex = this.getClickedRowIndex(evt);
            const now = new Date();
            if(!this._lastEmulatedClickTime) {
                const clickCanceled = !this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_CLICK, evt, rowIndex);
                clearTimeout(this._dblClickClearTimer);
                if(TaskAreaDomHelper.isMousePointer(evt))
                    this.raiseEvent(TaskAreaStateEventNames.CONTEXTMENU_HIDE, evt);
                if(!clickCanceled) {
                    this._lastEmulatedClickTime = now;
                    this._dblClickClearTimer = setTimeout(() => { delete this._lastEmulatedClickTime; }, TaskAreaDefaultState.defaultDblClickClearTimeout);
                }
            }
            else if(now.getTime() - this._lastEmulatedClickTime.getTime() < TaskAreaDefaultState.defaultDblClickTimeout) {
                this.raiseEvent(TaskAreaStateEventNames.TASK_AREA_DBLCLICK, evt, rowIndex);
                delete this._lastEmulatedClickTime;
            }
        }
    }

    protected canToEmulateClick(evt: PointerEvent | TouchEvent): boolean {
        const isDependency = TaskAreaDomHelper.isConnectorLine(evt);
        let canEmulate = !isDependency && this.getClickedRowIndex(evt) === this._lastTouchRowIndex;
        if(canEmulate && TaskAreaDomHelper.isMousePointer(evt))
            canEmulate &&= (evt as MouseEvent).button !== 2;
        return canEmulate;
    }
    protected changeSelectionOnTouchDown(evt: Event): void {
        const isDependency = TaskAreaDomHelper.isConnectorLine(evt);
        if(!isDependency)
            this.raiseTaskSelection(evt, this.getClickedRowIndex(evt));
        this.raiseDependencySelection(evt, isDependency ? EvtUtils.getEventSource(evt).getAttribute("dependency-id") : null);
    }
    protected showContextMenuOnTouchDown(evt: Event): void {
        const isDependency = TaskAreaDomHelper.isConnectorLine(evt);
        this.raiseEvent(TaskAreaStateEventNames.CONTEXTMENU_SHOW, evt, this.getClickedRowIndex(evt), { type: isDependency ? "dependency" : "task" });
    }
    protected clearTimers(): void {
        clearTimeout(this._contextMenuTimer);
        clearTimeout(this._dblClickClearTimer);
        delete this._lastEmulatedClickTime;
    }
}
