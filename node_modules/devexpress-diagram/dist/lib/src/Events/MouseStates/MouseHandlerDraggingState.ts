import { MouseHandlerCancellableState } from "./MouseHandlerStateBase";
import { DiagramMouseEvent, MouseButton, DiagramKeyboardEvent } from "../Event";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ItemKey } from "../../Model/DiagramItem";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { ModifierKey } from "@devexpress/utils/lib/utils/key";

export abstract class MouseHandlerDraggingState extends MouseHandlerCancellableState {
    protected modified: boolean;
    private mouseDownPoint: Point;
    protected mouseMoveEvent: DiagramMouseEvent;

    static dragStartLimit = UnitConverter.pixelsToTwips(4);

    constructor(handler: MouseHandler, protected history: History) {
        super(handler);
    }

    protected canApplyChangesOnMouseMove(initPosition: Point, position: Point): boolean {
        return !initPosition || !position ||
            Math.abs(initPosition.x - position.x) > MouseHandlerDraggingState.dragStartLimit ||
            Math.abs(initPosition.y - position.y) > MouseHandlerDraggingState.dragStartLimit;
    }
    protected onAfterApplyChanges() : void {
        if(!this.modified)
            this.handler.raiseDragStart(this.getDraggingElementKeys());
        this.modified = true;
        this.mouseDownPoint = undefined;
    }

    onMouseDown(evt: DiagramMouseEvent) {
        this.mouseDownPoint = evt.modelPoint.clone();
    }
    onMouseMove(evt: DiagramMouseEvent) {
        this.mouseMoveEvent = evt;
        if(evt.button !== MouseButton.Left) {
            this.cancelChanges();
            this.handler.switchToDefaultState();
        }
        else if(evt.button === MouseButton.Left && this.canApplyChangesOnMouseMove(this.mouseDownPoint, evt.modelPoint)) {
            this.onApplyChanges(evt);
            this.onAfterApplyChanges();
        }
    }

    onKeyDown(evt: DiagramKeyboardEvent): void {
        if(this.mouseMoveEvent && (evt.keyCode === 16 || evt.keyCode === 17 || evt.keyCode === 18)) 
            this.performMouseMoveEvent(evt.modifiers);
    }
    onKeyUp(evt: DiagramKeyboardEvent): void {
        if(this.mouseMoveEvent && (evt.keyCode === 16 || evt.keyCode === 17 || evt.keyCode === 18)) 
            this.performMouseMoveEvent(evt.modifiers);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        this.mouseDownPoint = undefined;
        this.mouseMoveEvent = undefined;
        this.handler.switchToDefaultState();
    }
    performMouseMoveEvent(modifiers: ModifierKey): void {
        this.mouseMoveEvent.modifiers = modifiers;
        this.onMouseMove(this.mouseMoveEvent);
    }
    start() {
        this.handler.beginStorePermissions();
        this.history.beginTransaction();
    }
    finish() {
        this.checkStoredPermissionsOnFinish();

        if(this.modified) {
            this.onFinishWithChanges();
            this.modified = false;
            this.history.endTransaction();
            this.handler.raiseDragEnd(this.getDraggingElementKeys());
        }
        else
            this.history.endTransaction();
        this.handler.endStorePermissions();

        this.handler.clearInteractingItems();
    }
    checkStoredPermissionsOnFinish() {
        if(!this.handler.isStoredPermissionsGranted()) {
            this.cancelChanges();
            this.modified = false;
        }
    }
    onFinishWithChanges() { }
    abstract getDraggingElementKeys(): ItemKey[];
    abstract onApplyChanges(evt: DiagramMouseEvent);

    cancelChanges() {
        this.handler.lockPermissions();
        this.history.undoTransaction();
        this.handler.unlockPermissions();
        if(this.modified)
            this.handler.raiseDragEnd(this.getDraggingElementKeys());
        this.modified = false;
    }

    getSnappedPoint(evt: DiagramMouseEvent, point: Point): Point {
        return this.handler.getSnappedPointOnDragPoint(evt, point);
    }
}
