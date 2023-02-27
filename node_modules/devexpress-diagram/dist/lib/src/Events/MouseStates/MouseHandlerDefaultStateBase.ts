import { MouseHandlerStateBase } from "./MouseHandlerStateBase";
import { DiagramMouseEvent, MouseEventElementType, DiagramWheelEvent, MouseButton, DiagramKeyboardEvent } from "../Event";
import { ItemKey } from "../../Model/DiagramItem";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { DiagramModel } from "../../Model/Model";
import { Selection } from "../../Selection/Selection";
import { MouseHandlerToggleShapeExpandedState } from "./MouseHandlerToggleShapeExpandedState";
import { MouseHandlerSelectionState } from "./MouseHandlerSelectionState";
import { MouseHandlerZoomOnWheelState } from "./MouseHandlerZoomOnWheelState";
import { IViewController } from "../../ViewController";
import { DiagramSettings } from "../../Settings";
import { MouseHandlerScrollingState } from "./MouseHandlerScrollingState";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { IShapeDescriptionManager } from "../../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { MouseHandlerZoomOnPinchState } from "./MouseHandlerZoomOnPinchState";

export abstract class MouseHandlerDefaultStateBase extends MouseHandlerStateBase {
    private startPoint: Point;
    static startLimit = UnitConverter.pixelsToTwips(1);

    constructor(handler: MouseHandler,
        protected history: History,
        protected selection: Selection,
        protected model: DiagramModel,
        protected view: IViewController,
        protected visualizerManager: IVisualizerManager,
        protected shapeDescriptionManager: IShapeDescriptionManager,
        protected settings: DiagramSettings) {
        super(handler);
    }

    onKeyDown(evt: DiagramKeyboardEvent): void {
        this.handler.onStartScrollPageByKeyboard(evt);
    }
    onKeyUp(evt: DiagramKeyboardEvent): void {
        this.handler.onFinishScrollPageByKeyboard(evt);
    }

    onMouseDown(evt: DiagramMouseEvent): void {
        if(!this.handler.canFinishTextEditing())
            return;
        this.onMouseDownCore(evt);
        if(this.handler.state !== this)
            this.handler.state.onMouseDown(evt);
    }
    onMouseDownCore(evt: DiagramMouseEvent): void {
        if(this.handler.canScrollPage(evt))
            this.startScrolling(evt);
        else if(this.hasDiagramItem(evt) && this.canDragObjectOnMouseDown(evt.source.key))
            this.onDragDiagramItemOnMouseDown(evt);
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ShapeExpandButton && this.canExpandContainerOnMouseDown(evt.source.key))
            this.onShapeExpandBtnMouseDown(evt);
        else {
            if(!this.hasDiagramItem(evt) && this.canClearSelectionOnMouseDown())
                this.clearSelection();
            this.startPoint = evt.modelPoint;
        }
    }

    onDragDiagramItemOnMouseDown(evt: DiagramMouseEvent) {
        this.replaceSelection(evt);
    }

    abstract canDragObjectOnMouseDown(key: ItemKey): boolean;
    abstract canExpandContainerOnMouseDown(key: ItemKey): boolean;
    abstract canClearSelectionOnMouseDown(): boolean;

    onMouseMove(evt: DiagramMouseEvent): void {
        this.onMouseMoveCore(evt);

        if(this.handler.state !== this) {
            this.handler.state.onMouseDown(this.handler.mouseDownEvent);
            this.handler.state.onMouseMove(evt);
        }
    }
    onMouseMoveCore(evt: DiagramMouseEvent): void {
        if(this.startPoint &&
            (Math.abs(this.startPoint.x - evt.modelPoint.x) > MouseHandlerDefaultStateBase.startLimit ||
            Math.abs(this.startPoint.y - evt.modelPoint.y) > MouseHandlerDefaultStateBase.startLimit)) {
            this.processOnMouseMoveAfterLimit(evt);
            this.startPoint = undefined;
        }
    }
    processOnMouseMoveAfterLimit(evt: DiagramMouseEvent) {
        if(evt.isTouchMode)
            if(evt.touches.length > 1)
                this.startZooming(evt);
            else
                this.startScrolling(evt);
        else
            this.startSelection(evt);
    }

    onMouseUp(evt: DiagramMouseEvent): void {
        this.onMouseUpCore(evt);
        if(this.handler.state !== this)
            this.handler.state.onMouseUp(evt);
    }
    private onMouseUpCore(evt: DiagramMouseEvent): void {
        if(evt.source.type === MouseEventElementType.Shape && this.canSelectOnMouseUp(evt.source.key))
            this.replaceSelection(evt);
        else if(evt.source.type === MouseEventElementType.Connector && this.canSelectOnMouseUp(evt.source.key))
            this.replaceSelection(evt);
        else if(evt.source.type === MouseEventElementType.ShapeExpandButton && this.canSelectOnMouseUp(evt.source.key))
            this.replaceSelection(evt);
        else if(this.startPoint && this.canClearSelectionOnMouseUp())
            this.clearSelection();
        this.startPoint = undefined;
    }

    abstract canSelectOnMouseUp(key: ItemKey): boolean;
    abstract canClearSelectionOnMouseUp(): boolean;

    onMouseWheel(evt: DiagramWheelEvent): boolean {
        if(this.handler.canStartZoomOnWheel(evt)) {
            this.handler.switchState(new MouseHandlerZoomOnWheelState(this.handler, this.settings, this.view));
            this.handler.state.onMouseWheel(evt);
            return true;
        }
        return false;
    }
    onLongTouch(evt: DiagramMouseEvent): void {
        this.replaceMultipleSelection(evt.source.key);
    }
    finish(): void {
        this.startPoint = undefined;
    }

    startSelection(evt: DiagramMouseEvent): void {
        if(evt.button === MouseButton.Left)
            this.handler.switchState(new MouseHandlerSelectionState(this.handler, this.selection, this.visualizerManager));
    }
    startScrolling(evt: DiagramMouseEvent): void {
        if(evt.button === MouseButton.Left) {
            this.handler.raiseDragScrollStart();
            this.handler.switchState(new MouseHandlerScrollingState(this.handler, this.view, this.selection));
        }
    }
    startZooming(evt: DiagramMouseEvent) {
        this.handler.switchState(new MouseHandlerZoomOnPinchState(this.handler, this.selection, this.settings, this.view));
    }
    inSelection(key: ItemKey): boolean {
        return this.selection.hasKey(key);
    }

    private hasDiagramItem(evt: DiagramMouseEvent) : boolean {
        return evt.source.type === MouseEventElementType.Shape ||
            evt.source.type === MouseEventElementType.Connector;
    }
    private onShapeExpandBtnMouseDown(evt: DiagramMouseEvent): void {
        this.handler.addDiagramItemToSelection(evt);
        this.handler.switchState(new MouseHandlerToggleShapeExpandedState(this.handler, this.history, this.model, this.selection));
    }

    private replaceSelection(evt: DiagramMouseEvent) {
        if(this.handler.canMultipleSelection(evt))
            this.replaceMultipleSelection(evt.source.key);
        else
            this.handler.changeSingleSelection(evt.source.key);
    }
    private replaceMultipleSelection(key: ItemKey) {
        if(this.selection.hasKey(key))
            this.selection.remove(key);
        else
            this.selection.add(key);
    }
    private clearSelection(): void {
        this.selection.set([]);
    }
}
