import { Browser } from "@devexpress/utils/lib/browser";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { ITaskAreaEventsListener } from "./TaskAreaEventsListener";
import { TaskAreaStateController } from "./States/StateController";
import { Size } from "@devexpress/utils/lib/geometry/size";

export const TOUCH_ACTION_NONE = "dx-gantt-touch-action";

export class TaskAreaManager {
    static DBLCLICK_INTERVAL = 300;
    static MS_POINTER_ACTIVE_CLASS = "ms-pointer-active";

    private _eventListener: ITaskAreaEventsListener;
    private _taskArea: HTMLElement;
    private _cellSize: Size;

    constructor(listener: ITaskAreaEventsListener, taskArea: HTMLElement, cellSize: Size) {
        this._eventListener = listener;
        this._taskArea = taskArea;
        this._cellSize = cellSize;
        this.attachEvents();
    }
    public attachEvents(): void {
        if(window.PointerEvent)
            this.attachPointerEvents();
        else if(Browser.TouchUI)
            this.attachTouchEvents();
        else
            this.attachMouseEvents();
        this.attachCommonEvents();
    }
    public detachEvents():void {
        if(window.PointerEvent)
            this.detachPointerEvents();
        else if(Browser.TouchUI)
            this.detachTouchEvents();
        else
            this.detachMouseEvents();
        this.detachCommonEvents();
    }
    public attachEventsOnTask(taskElement: HTMLElement): void {
        if(window.PointerEvent)
            taskElement?.addEventListener("pointerenter", this.onTaskPointerEnterHandler);
        else if(Browser.TouchUI)
            taskElement?.addEventListener("touchstart", this.onTaskTouchStartHandler);
        else {
            taskElement?.addEventListener("mouseenter", this.onTaskMouseEnterHandler);
            taskElement?.addEventListener("mouseleave", this.onTaskMouseLeaveHandler);
        }
    }
    public detachEventsOnTask(taskElement: HTMLElement): void {
        if(window.PointerEvent)
            taskElement?.removeEventListener("pointerenter", this.onTaskPointerEnterHandler);
        else if(Browser.TouchUI)
            taskElement?.removeEventListener("touchstart", this.onTaskTouchStartHandler);
        else {
            taskElement?.removeEventListener("mouseenter", this.onTaskMouseEnterHandler);
            taskElement?.removeEventListener("mouseleave", this.onTaskMouseLeaveHandler);
        }
    }

    protected attachCommonEvents(): void {
        this.taskAreaAddEventListener("contextmenu", this.onContextMenuHandler);
        this.taskAreaAddEventListener(EvtUtils.getMouseWheelEventName(), this.onMouseWheelHandler);
        this.taskAreaAddEventListener("scroll", this.onScrollHandler);
        document.addEventListener("keydown", this.onKeyDownHandler);
    }
    protected detachCommonEvents(): void {
        this.taskAreaRemoveEventListener("contextmenu", this.onContextMenuHandler);
        this.taskAreaRemoveEventListener(EvtUtils.getMouseWheelEventName(), this.onMouseWheelHandler);
        this.taskAreaRemoveEventListener("scroll", this.onScrollHandler);
        document.removeEventListener("keydown", this.onKeyDownHandler);
    }
    protected attachPointerEvents(): void {
        DomUtils.addClassName(this.taskArea, TOUCH_ACTION_NONE);
        document.addEventListener("pointerdown", this.onDocumentPointerDownHandler);
        document.addEventListener("pointerup", this.onDocumentPointerUpHandler);
        document.addEventListener("pointermove", this.onDocumentPointerMoveHandler);
        document.addEventListener("pointercancel", this.onDocumentPointerCancelUpHandler);
        this.taskAreaAddEventListener("pointerleave", this.onTaskAreaPointerLeaveHandler);
    }

    protected detachPointerEvents(): void {
        document.removeEventListener("pointerdown", this.onDocumentPointerDownHandler);
        document.removeEventListener("pointerup", this.onDocumentPointerUpHandler);
        document.removeEventListener("pointermove", this.onDocumentPointerMoveHandler);
        document.removeEventListener("pointercancel ", this.onDocumentPointerCancelUpHandler);
        this.taskAreaRemoveEventListener("pointerleave", this.onTaskAreaPointerLeaveHandler);
        DomUtils.removeClassName(this.taskArea, TOUCH_ACTION_NONE);
    }
    protected attachTouchEvents(): void {
        DomUtils.addClassName(this.taskArea, TOUCH_ACTION_NONE);
        document.addEventListener("touchstart", this.onTouchStartHandler);
        document.addEventListener("touchend", this.onTouchEndHandler);
        document.addEventListener("touchmove", this.onTouchMoveHandler);
    }

    protected detachTouchEvents(): void {
        document.removeEventListener("touchstart", this.onTouchStartHandler);
        document.removeEventListener("touchend", this.onTouchEndHandler);
        document.removeEventListener("touchmove", this.onTouchMoveHandler);
        DomUtils.removeClassName(this.taskArea, TOUCH_ACTION_NONE);
    }
    protected attachMouseEvents(): void {
        this.taskAreaAddEventListener("click", this.onMouseClickHandler);
        this.taskAreaAddEventListener("dblclick", this.onMouseDblClickHandler);
        this.taskAreaAddEventListener("mousedown", this.onMouseDownHandler);
        this.taskAreaAddEventListener("mouseleave", this.onTaskAreaMouseLeaveHandler);
        document.addEventListener("mousemove", this.onMouseMoveHandler);
        document.addEventListener("mouseup", this.onMouseUpHandler);
    }
    protected detachMouseEvents(): void {
        this.taskAreaRemoveEventListener("click", this.onMouseClickHandler);
        this.taskAreaRemoveEventListener("dblclick", this.onMouseDblClickHandler);
        this.taskAreaRemoveEventListener("mouseleave", this.onTaskAreaMouseLeaveHandler);
        this.taskAreaRemoveEventListener("mousedown", this.onMouseDownHandler);
        document.removeEventListener("mousemove", this.onMouseMoveHandler);
        document.removeEventListener("mouseup", this.onMouseUpHandler);
    }

    private _stateController: TaskAreaStateController;
    protected get stateController(): TaskAreaStateController {
        this._stateController ??= new TaskAreaStateController(this._eventListener, this._taskArea, this._cellSize);
        return this._stateController;
    }
    protected get taskArea(): HTMLElement {
        return this._taskArea;
    }
    protected taskAreaAddEventListener(type: string, eventHandler: EventListenerOrEventListenerObject): void {
        this.taskArea.addEventListener(type, eventHandler);
    }
    protected taskAreaRemoveEventListener(type: string, eventHandler: EventListenerOrEventListenerObject): void {
        this.taskArea.removeEventListener(type, eventHandler);
    }
    private _onContextMenuHandler: (evt: MouseEvent) => void;
    protected get onContextMenuHandler(): (evt: MouseEvent) => void {
        this._onContextMenuHandler ??= (evt) => { this.stateController.onContextMenu(evt); };
        return this._onContextMenuHandler;
    }
    private _onMouseWheelHandler: (evt: MouseEvent) => void;
    protected get onMouseWheelHandler(): (evt: MouseEvent) => void {
        this._onMouseWheelHandler ??= (evt) => { this.stateController.onMouseWheel(<WheelEvent>evt); };
        return this._onMouseWheelHandler;
    }
    private _onScrollHandler: (evt: Event) => void;
    protected get onScrollHandler(): (evt: Event) => void {
        this._onScrollHandler ??= (evt) => { this.stateController.onScroll(evt); };
        return this._onScrollHandler;
    }
    private _onKeyDownHandler: (evt: KeyboardEvent) => void;
    protected get onKeyDownHandler(): (evt: KeyboardEvent) => void {
        this._onKeyDownHandler ??= (evt) => { this.stateController.onKeyDown(evt); };
        return this._onKeyDownHandler;
    }
    private _onTaskPointerEnterHandler: (evt: PointerEvent) => void;
    protected get onTaskPointerEnterHandler(): (evt: PointerEvent) => void {
        this._onTaskPointerEnterHandler ??= (evt) => { this.stateController.onTaskPointerEnter(evt); };
        return this._onTaskPointerEnterHandler;
    }

    private _onTaskAreaPointerLeaveHandler: (evt: PointerEvent) => void;
    protected get onTaskAreaPointerLeaveHandler(): (evt: PointerEvent) => void {
        this._onTaskAreaPointerLeaveHandler ??= (evt) => { this.stateController.onTaskAreaPointerLeave(evt); };
        return this._onTaskAreaPointerLeaveHandler;
    }

    private _onDocumentPointerDownHandler: (evt: PointerEvent) => void;
    protected get onDocumentPointerDownHandler(): (evt: PointerEvent) => void {
        this._onDocumentPointerDownHandler ??= (evt) => { this.stateController.onDocumentPointerDown(evt); };
        return this._onDocumentPointerDownHandler;
    }
    private _onDocumentPointerUpHandler: (evt: PointerEvent) => void;
    protected get onDocumentPointerUpHandler(): (evt: PointerEvent) => void {
        this._onDocumentPointerUpHandler ??= (evt) => { this.stateController.onDocumentPointerUp(evt); };
        return this._onDocumentPointerUpHandler;
    }
    private _onDocumentPointerCancelHandler: (evt: PointerEvent) => void;
    protected get onDocumentPointerCancelUpHandler(): (evt: PointerEvent) => void {
        this._onDocumentPointerCancelHandler ??= (evt) => { this.stateController.onDocumentPointerCancel(evt); };
        return this._onDocumentPointerCancelHandler;
    }
    private _onDocumentPointerMoveHandler: (evt: PointerEvent) => void;
    protected get onDocumentPointerMoveHandler(): (evt: PointerEvent) => void {
        this._onDocumentPointerMoveHandler ??= (evt) => { this.stateController.onDocumentPointerMove(evt); };
        return this._onDocumentPointerMoveHandler;
    }
    private _onTouchStartHandler: (evt: TouchEvent) => void;
    protected get onTouchStartHandler(): (evt: TouchEvent) => void {
        this._onTouchStartHandler ??= (evt) => { this.stateController.onTouchStart(evt); };
        return this._onTouchStartHandler;
    }
    private _onTouchEndHandler: (evt: TouchEvent) => void;
    protected get onTouchEndHandler(): (evt: TouchEvent) => void {
        this._onTouchEndHandler ??= (evt) => { this.stateController.onTouchEnd(evt); };
        return this._onTouchEndHandler;
    }
    private _onTouchMoveHandler: (evt: TouchEvent) => void;
    protected get onTouchMoveHandler(): (evt: TouchEvent) => void {
        this._onTouchMoveHandler ??= (evt) => { this.stateController.onTouchMove(evt); };
        return this._onTouchMoveHandler;
    }
    private _onTaskTouchStartHandler: (evt: TouchEvent) => void;
    protected get onTaskTouchStartHandler(): (evt: TouchEvent) => void {
        this._onTaskTouchStartHandler ??= (evt) => { this.stateController.onTaskTouchStart(evt); };
        return this._onTaskTouchStartHandler;
    }
    private _onMouseClickHandler: (evt: MouseEvent) => void;
    protected get onMouseClickHandler(): (evt: MouseEvent) => void {
        this._onMouseClickHandler ??= (evt) => { this.stateController.onClick(evt); };
        return this._onMouseClickHandler;
    }
    private _onMouseDblClickHandler: (evt: MouseEvent) => void;
    protected get onMouseDblClickHandler(): (evt: MouseEvent) => void {
        this._onMouseDblClickHandler ??= (evt) => { this.stateController.onDblClick(evt); };
        return this._onMouseDblClickHandler;
    }
    private _onMouseDownHandler: (evt: MouseEvent) => void;
    protected get onMouseDownHandler(): (evt: MouseEvent) => void {
        this._onMouseDownHandler ??= (evt) => { this.stateController.onMouseDown(evt); };
        return this._onMouseDownHandler;
    }
    private _onTaskAreaMouseLeaveHandler: (evt: MouseEvent) => void;
    protected get onTaskAreaMouseLeaveHandler(): (evt: MouseEvent) => void {
        this._onTaskAreaMouseLeaveHandler ??= (evt) => { this.stateController.onTaskAreaMouseLeave(evt); };
        return this._onTaskAreaMouseLeaveHandler;
    }
    private _onMouseMoveHandler: (evt: MouseEvent) => void;
    protected get onMouseMoveHandler(): (evt: MouseEvent) => void {
        this._onMouseMoveHandler ??= (evt) => { this.stateController.onMouseMove(evt); };
        return this._onMouseMoveHandler;
    }
    private _onMouseUpHandler: (evt: MouseEvent) => void;
    protected get onMouseUpHandler(): (evt: MouseEvent) => void {
        this._onMouseUpHandler ??= (evt) => { this.stateController.onMouseUp(evt); };
        return this._onMouseUpHandler;
    }
    private _onTaskMouseEnterHandler: (evt: MouseEvent) => void;
    protected get onTaskMouseEnterHandler(): (evt: MouseEvent) => void {
        this._onTaskMouseEnterHandler ??= (evt) => { this.stateController.onTaskElementHover(evt); };
        return this._onTaskMouseEnterHandler;
    }
    private _onTaskMouseLeaveHandler: (evt: MouseEvent) => void;
    protected get onTaskMouseLeaveHandler(): (evt: MouseEvent) => void {
        this._onTaskMouseLeaveHandler ??= (evt) => { this.stateController.onTaskElementLeave(evt); };
        return this._onTaskMouseLeaveHandler;
    }
}
