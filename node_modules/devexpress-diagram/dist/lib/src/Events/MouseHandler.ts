import { MouseHandlerStateBase } from "./MouseStates/MouseHandlerStateBase";
import { MouseHandlerDefaultState } from "./MouseStates/MouseHandlerDefaultState";
import { DiagramMouseEvent, DiagramWheelEvent, DiagramKeyboardEvent, DiagramEvent, MouseButton, MouseEventElementType } from "./Event";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { IEventManager, IVisualizersListener, IConnectionChangeOperationParams } from "./EventManager";
import { DiagramDraggingEvent } from "../Render/Toolbox/Toolbox";
import { ModelUtils } from "../Model/ModelUtils";
import { History } from "../History/History";
import { Selection } from "../Selection/Selection";
import { DiagramModel } from "../Model/Model";
import { ItemKey, ConnectionPointSide, DiagramItem } from "../Model/DiagramItem";
import { MouseHandlerDefaultStateBase } from "./MouseStates/MouseHandlerDefaultStateBase";
import { IReadOnlyChangesListener, DiagramSettings } from "../Settings";
import { IViewController } from "../ViewController";
import { MouseHandlerDefaultReadOnlyTouchState } from "./MouseStates/MouseHandlerDefaultReadOnlyTouchState";
import { MouseHandlerDefaultReadOnlyState } from "./MouseStates/MouseHandlerDefaultReadOnlyState";
import { MouseHandlerDefaultTouchState } from "./MouseStates/MouseHandlerDefaultTouchState";
import { IVisualizerManager } from "./Visualizers/VisualizersManager";
import { IContextToolboxHandler } from "./ContextToolboxHandler";
import { IShapeDescriptionManager } from "../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { Shape } from "../Model/Shapes/Shape";
import { ConnectionPointInfo } from "./Visualizers/ConnectionPointsVisualizer";
import { ExtensionLine } from "./Visualizers/ExtensionLinesVisualizer";
import { IPermissionsProvider } from "../Model/Permissions/PermissionsProvider";
import { Connector } from "../Model/Connectors/Connector";
import { ConnectionTargetInfo } from "./Visualizers/ConnectionTargetVisualizer";
import { ContainerTargetInfo } from "./Visualizers/ContainerTargetVisualizer";
import { DiagramModelOperation } from "../ModelOperationSettings";
import { KeyCode, ModifierKey } from "@devexpress/utils/lib/utils/key";
import { EventUtils } from "../Utils";

export class MouseHandler implements IReadOnlyChangesListener, IVisualizersListener {
    private newState: MouseHandlerStateBase;

    state: MouseHandlerStateBase;
    mouseDownEvent: DiagramMouseEvent;
    pressedDiagramItemKey : string;
    pressedDiagramItemInSelection: boolean;

    private shouldScrollPage : boolean;

    allowScrollPage: boolean;
    allowMultipleSelection: boolean;
    allowCopyDiagramItems: boolean;
    allowSnapToCellOnDragDiagramItem: boolean;
    allowSnapToCellOnDragPoint: boolean;
    allowSnapToCellOnResizeShape: boolean;
    allowFixedDrag: boolean;
    allowZoomOnWheel: boolean;

    copyDiagramItemsByCtrlAndShift : boolean;
    startScrollingPageByCtrl: boolean;

    private defaultState: MouseHandlerDefaultStateBase;
    private finishStateLock = 0;

    constructor(
        protected history: History,
        protected selection: Selection,
        protected model: DiagramModel,
        protected eventManager: IEventManager,
        protected readOnly: boolean,
        protected view: IViewController,
        protected visualizerManager: IVisualizerManager,
        protected contextToolboxHandler: IContextToolboxHandler,
        protected shapeDescriptionManager: IShapeDescriptionManager,
        protected settings: DiagramSettings,
        protected permissionsProvider: IPermissionsProvider) {
        this.initialize(model);
        this.selection.onChanged.add(this);
    }

    initialize(model: DiagramModel) {
        this.model = model;

        this.allowMultipleSelection = true;
        this.allowCopyDiagramItems = true;
        this.allowSnapToCellOnDragDiagramItem = true;
        this.allowSnapToCellOnDragPoint = true;
        this.allowSnapToCellOnResizeShape = true;
        this.allowFixedDrag = true;
        this.allowZoomOnWheel = true;

        this.allowScrollPage = true;
        this.shouldScrollPage = false;

        this.copyDiagramItemsByCtrlAndShift = false;
        this.startScrollingPageByCtrl = false;

        this.initializeDefaultState();
    }
    initializeDefaultState() {
        this.defaultState = this.readOnly ?
            (EventUtils.isTouchMode() ?
                new MouseHandlerDefaultReadOnlyTouchState(this, this.history, this.selection, this.model, this.view,
                    this.visualizerManager, this.shapeDescriptionManager, this.settings) :
                new MouseHandlerDefaultReadOnlyState(this, this.history, this.selection, this.model, this.view,
                    this.visualizerManager, this.shapeDescriptionManager, this.settings)) :
            (EventUtils.isTouchMode() ?
                new MouseHandlerDefaultTouchState(this, this.history, this.selection, this.model, this.view,
                    this.visualizerManager, this.shapeDescriptionManager, this.settings) :
                new MouseHandlerDefaultState(this, this.history, this.selection, this.model, this.view,
                    this.visualizerManager, this.shapeDescriptionManager, this.settings));
        this.switchToDefaultState();
    }

    onMouseDown(evt: DiagramMouseEvent) {
        this.mouseDownEvent = evt;
        this.state.onMouseDown(evt);
    }
    onMouseMove(evt: DiagramMouseEvent) {
        this.state.onMouseMove(evt);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        this.state.onMouseUp(evt);
    }
    onMouseDblClick(evt: DiagramMouseEvent) {
        this.state.onMouseDblClick(evt);
    }
    onMouseClick(evt: DiagramMouseEvent) {
        this.state.onMouseClick(evt);
    }
    onLongTouch(evt: DiagramMouseEvent) {
        if(!evt.touches || evt.touches.length > 1)
            return;

        const key = evt.source.key;
        if(key === undefined)
            this.selection.clear();
        else if(this.selection.hasKey(key))
            this.selection.remove(key);
        else
            this.selection.add(key);
    }
    onShortcut(code: number): boolean {
        return this.state.onShortcut(code);
    }
    onWheel(evt: DiagramWheelEvent): boolean {
        return this.state.onMouseWheel(evt);
    }
    onDragStart(evt: DiagramDraggingEvent) {
        this.state.onDragStart(evt);
    }
    onDragEnd(evt: DiagramMouseEvent) {
        this.state.onDragEnd(evt);
    }
    onKeyDown(evt: DiagramKeyboardEvent): void {
        this.state.onKeyDown(evt);
    }
    onKeyUp(evt: DiagramKeyboardEvent): void {
        this.state.onKeyUp(evt);
    }

    showContextToolbox(modelPoint: Point, getPositionToInsertShapeTo: (shape: Shape) => Point, side: ConnectionPointSide, category: string,
        applyCallback: (shapeType: string) => void, cancelCallback: () => void) {
        this.contextToolboxHandler.showContextToolbox(modelPoint, getPositionToInsertShapeTo, side, category, applyCallback, cancelCallback);
    }
    hideContextToolbox(applyed: boolean) {
        this.contextToolboxHandler.hideContextToolbox(applyed);
    }
    canScrollPage(evt: DiagramMouseEvent) : boolean {
        if(this.startScrollingPageByCtrl) {
            if(!this.hasCtrlModifier(evt.modifiers))
                return false;
            if(!this.copyDiagramItemsByCtrlAndShift)
                return true;
            return evt.source.type !== MouseEventElementType.Shape && evt.source.type !== MouseEventElementType.Connector;
        }
        return this.allowScrollPage && this.shouldScrollPage;
    }
    canMultipleSelection(evt: DiagramMouseEvent) : boolean {
        return this.allowMultipleSelection && this.hasCtrlOrShiftModifier(evt.modifiers);
    }
    canCopySelectedItems(evt: DiagramMouseEvent) : boolean {
        if(!this.allowCopyDiagramItems)
            return false;
        return this.copyDiagramItemsByCtrlAndShift ? this.hasCtrlAndShiftModifier(evt.modifiers) : this.hasAltModifier(evt.modifiers);
    }
    canCalculateFixedPosition(evt: DiagramMouseEvent) : boolean {
        if(!this.allowFixedDrag || !this.hasShiftModifier(evt.modifiers))
            return false;
        if(this.copyDiagramItemsByCtrlAndShift && this.hasCtrlModifier(evt.modifiers))
            return false;
        return true;
    }
    canStartZoomOnWheel(evt: DiagramWheelEvent) {
        return this.allowZoomOnWheel && this.hasCtrlModifier(evt.modifiers);
    }
    canFinishZoomOnWheel(evt: DiagramEvent) {
        return this.allowZoomOnWheel && !this.hasCtrlModifier(evt.modifiers);
    }
    onStartScrollPageByKeyboard(evt: DiagramKeyboardEvent) {
        if(this.canStartScrollingPageByKeyboard(evt)) {
            this.raiseDragScrollStart();
            this.shouldScrollPage = true;
        }
    }
    onFinishScrollPageByKeyboard(evt: DiagramKeyboardEvent) {
        if(this.canEndScrollingPageByKeyboard(evt))
            this.finishScrollingPage();
    }
    onFinishScrollPageByMouse(evt: DiagramMouseEvent) {
        if(this.canEndScrollingPage(evt))
            this.finishScrollingPage();
    }

    private finishScrollingPage() : void {
        this.shouldScrollPage = false;
        this.raiseDragScrollEnd();
        this.switchToDefaultState();
    }


    private hasCtrlOrShiftModifier(key: ModifierKey): boolean {
        return this.hasCtrlModifier(key) || this.hasShiftModifier(key);
    }
    private hasCtrlAndShiftModifier(key: ModifierKey): boolean {
        return this.hasCtrlModifier(key) && this.hasShiftModifier(key);
    }
    private hasCtrlModifier(key: ModifierKey): boolean {
        return (key & ModifierKey.Ctrl) > 0;
    }
    private hasAltModifier(key: ModifierKey): boolean {
        return (key & ModifierKey.Alt) > 0;
    }
    private hasShiftModifier(key: ModifierKey): boolean {
        return (key & ModifierKey.Shift) > 0;
    }
    private canStartScrollingPageByKeyboard(evt: DiagramKeyboardEvent) : boolean {
        return !this.startScrollingPageByCtrl && !this.shouldScrollPage && evt.keyCode === KeyCode.Space;
    }
    private canEndScrollingPageByKeyboard(evt: DiagramKeyboardEvent) : boolean {
        return !this.startScrollingPageByCtrl && evt.keyCode === KeyCode.Space;
    }
    private canEndScrollingPage(evt: DiagramMouseEvent) : boolean {
        return this.startScrollingPageByCtrl ? this.hasCtrlModifier(evt.modifiers) : true;
    }
    getSnappedPointOnDragDiagramItem(evt: DiagramMouseEvent, basePoint: Point, fixedX: boolean, fixedY: boolean, startPoint: Point): Point {
        const snapToCell = this.getSnapToCellOnDragDiagramItem(evt);
        return new Point(
            this.getSnappedPos(this.getFixedXPosition(evt, basePoint, fixedX, startPoint), true, snapToCell),
            this.getSnappedPos(this.getFixedYPosition(evt, basePoint, fixedY, startPoint), false, snapToCell));
    }
    getSnappedPointOnDragPoint(evt: DiagramMouseEvent, point: Point, additionalSnappedPoint?: Point): Point {
        const snapToCell = this.getSnapToCellOnDragPoint(evt);
        const x = this.getSnappedPos(point.x, true, snapToCell);
        const y = this.getSnappedPos(point.y, false, snapToCell);
        if(additionalSnappedPoint === undefined)
            return new Point(x, y);
        else
        if(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2) < Math.pow(point.x - additionalSnappedPoint.x, 2) + Math.pow(point.y - additionalSnappedPoint.y, 2))
            return new Point(x, y);
        else
            return additionalSnappedPoint;
    }
    getSnappedOffsetOnDragPoint(evt: DiagramMouseEvent, startPoint: Point) : Point {
        const snapToCell = this.getSnapToCellOnDragPoint(evt);
        return new Point(
            this.getSnappedPos(evt.modelPoint.x - startPoint.x, true, snapToCell),
            this.getSnappedPos(evt.modelPoint.y - startPoint.y, false, snapToCell)
        );
    }
    lockAspectRatioOnShapeResize(evt: DiagramMouseEvent) : boolean {
        return this.hasShiftModifier(evt.modifiers);
    }
    getSnappedPositionOnResizeShape(evt: DiagramMouseEvent, pos: number, isHorizontal: boolean): number {
        if(!this.getSnapToCellOnResizeShape(evt))
            return pos;
        return ModelUtils.getSnappedPos(this.model, this.settings.gridSize, pos, isHorizontal);
    }
    private getSnappedPos(pos: number, isHorizontal: boolean, snapToCell : boolean): number {
        return snapToCell ? ModelUtils.getSnappedPos(this.model, this.settings.gridSize, pos, isHorizontal) : pos;
    }
    private getFixedXPosition(evt: DiagramMouseEvent, basePoint: Point, fixedX: boolean, startPoint: Point): number {
        return fixedX ? basePoint.x : basePoint.x + evt.modelPoint.x - startPoint.x;
    }
    private getFixedYPosition(evt: DiagramMouseEvent, basePoint: Point, fixedY: boolean, startPoint: Point): number {
        return fixedY ? basePoint.y : basePoint.y + evt.modelPoint.y - startPoint.y;
    }
    private getSnapToCellOnDragDiagramItem(evt: DiagramMouseEvent) : boolean {
        return this.allowSnapToCellOnDragDiagramItem &&
            this.settings.snapToGrid &&
            !this.hasCtrlModifier(evt.modifiers);
    }
    private getSnapToCellOnDragPoint(evt: DiagramMouseEvent) : boolean {
        return this.allowSnapToCellOnDragPoint &&
            this.settings.snapToGrid &&
            !this.hasCtrlModifier(evt.modifiers);
    }
    private getSnapToCellOnResizeShape(evt: DiagramMouseEvent) : boolean {
        return this.allowSnapToCellOnResizeShape &&
            this.settings.snapToGrid &&
            !this.hasCtrlModifier(evt.modifiers);
    }
    tryUpdateModelSize(processPoints?: (offsetLeft: number, offsetTop: number) => void) {
        this.lockPermissions();
        ModelUtils.tryUpdateModelRectangle(this.history, processPoints);
        this.unlockPermissions();
    }

    canAddDiagramItemToSelection(evt: DiagramMouseEvent) : boolean {
        return evt.source.key && (evt.button === MouseButton.Left || evt.button === MouseButton.Right);
    }
    addDiagramItemToSelection(evt: DiagramMouseEvent) : void {
        this.pressedDiagramItemKey = evt.source.key;
        this.pressedDiagramItemInSelection = this.selection.hasKey(this.pressedDiagramItemKey);
        if(this.canMultipleSelection(evt))
            this.selection.add(evt.source.key);
        else
            this.changeSingleSelection(evt.source.key);
    }
    canRemoveDiagramItemToSelection(evt: DiagramMouseEvent) : boolean {
        return this.pressedDiagramItemKey &&
            evt.source.key &&
            this.pressedDiagramItemKey === evt.source.key &&
            (evt.button === MouseButton.Left || evt.button === MouseButton.Right);
    }
    removeDiagramItemFromSelection(button: MouseButton, sourceKey: string) : void {
        if(this.pressedDiagramItemInSelection && this.selection.getKeys().length > 1 && button === MouseButton.Left)
            this.selection.remove(sourceKey);
    }
    changeSingleSelection(key: ItemKey) {
        if(!this.selection.hasKey(key))
            this.selection.set([key]);
    }
    notifySelectionChanged(selection: Selection) {
        if(this.pressedDiagramItemKey && !this.selection.hasKey(this.pressedDiagramItemKey)) {
            this.pressedDiagramItemKey = undefined;
            this.pressedDiagramItemInSelection = false;
        }
    }

    raiseDragStart(keys: ItemKey[]) {
        this.eventManager.onDocumentDragStart(keys);
    }
    raiseDragEnd(keys: ItemKey[]) {
        this.eventManager.onDocumentDragEnd(keys);
    }
    raiseDragScrollStart() {
        this.eventManager.onDocumentDragScrollStart();
    }
    raiseDragScrollEnd() {
        this.eventManager.onDocumentDragScrollEnd();
    }
    raiseClick(keys: ItemKey[]) {
        this.eventManager.onDocumentClick(keys);
    }

    beginStorePermissions() : void {
        this.permissionsProvider.beginStorePermissions();
    }
    endStorePermissions() : void {
        this.permissionsProvider.endStorePermissions();
    }
    isStoredPermissionsGranted() : boolean {
        return this.permissionsProvider.isStoredPermissionsGranted();
    }

    lockPermissions() : void {
        this.permissionsProvider.lockPermissions();
    }
    unlockPermissions() : void {
        this.permissionsProvider.unlockPermissions();
    }
    canPerformChangeConnection(connector: Connector, operationParams: IConnectionChangeOperationParams): boolean {
        let allowed = true;
        if(connector)
            allowed = this.permissionsProvider.canChangeConnection(connector, operationParams.item, operationParams.oldItem, operationParams.position, operationParams.connectionPointIndex);
        else if(operationParams.item)
            allowed = this.permissionsProvider.canChangeConnection(undefined, operationParams.item, operationParams.oldItem, operationParams.position, operationParams.connectionPointIndex);
        return allowed;
    }
    canPerformChangeConnectionOnUpdateUI(connector: Connector, operationParams: IConnectionChangeOperationParams): boolean {
        this.permissionsProvider.beginUpdateUI();
        const allowed = this.canPerformChangeConnection(connector, operationParams);
        this.permissionsProvider.endUpdateUI();
        return allowed;
    }
    canFinishTextEditing(): boolean {
        return this.eventManager.canFinishTextEditing();
    }
    restartState() : void {
        if(this.state && !this.finishStateLock) {
            this.finishStateLock++;
            this.state.finish();
            this.finishStateLock--;
        }
        this.state.start();
    }

    public switchToDefaultState() {
        this.switchState(this.defaultState);
    }

    public switchState(state: MouseHandlerStateBase) {
        this.newState = state;
        if(this.state && !this.finishStateLock) {
            this.finishStateLock++;
            this.state.finish();
            this.finishStateLock--;
        }
        if(this.newState) {
            this.state = this.newState;
            this.state.start();
            this.newState = undefined;
        }
    }

    public addInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): void {
        this.permissionsProvider.addInteractingItem(item, operation);
    }
    public clearInteractingItems(): void {
        this.permissionsProvider.clearInteractingItems();
    }

    notifyReadOnlyChanged(readOnly: boolean) {
        this.readOnly = readOnly;
        this.initializeDefaultState();
    }

    notifySelectionRectShow(rect: Rectangle): void { }
    notifySelectionRectHide(): void { }
    notifyResizeInfoShow(point: Point, text: string): void { }
    notifyResizeInfoHide(): void { }
    notifyConnectionPointsShow(key: string, points: ConnectionPointInfo[], activePointIndex: number, outsideRectangle: Rectangle): void {
        this.state.onConnectionPointsShow(key, points);
    }
    notifyConnectionPointsHide(): void { }
    notifyConnectionTargetShow(key: string, info: ConnectionTargetInfo): void {
        this.state.onConnectionTargetShow(key, info);
    }
    notifyConnectionTargetHide(): void { }
    notifyContainerTargetShow(key: string, info: ContainerTargetInfo): void { }
    notifyContainerTargetHide(): void { }
    notifyExtensionLinesShow(lines: ExtensionLine[]): void { }
    notifyExtensionLinesHide(): void { }
}
