import { DiagramControl } from "../Diagram";
import { MouseHandler } from "./MouseHandler";
import { DiagramMouseEvent, IMouseOperationsListener, ITextInputOperationListener, DiagramEvent, DiagramKeyboardEvent, DiagramFocusEvent, DiagramClipboardEvent, DiagramWheelEvent, DiagramContextMenuEvent } from "./Event";
import { EventDispatcher, EventUtils } from "../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramItem, ItemKey } from "../Model/DiagramItem";
import { TextInputHandler } from "./TextInputHandler";
import { DiagramDraggingEvent, Toolbox } from "../Render/Toolbox/Toolbox";
import { ExtensionLine } from "./Visualizers/ExtensionLinesVisualizer";
import { ConnectionPointInfo } from "./Visualizers/ConnectionPointsVisualizer";
import { ContextMenuHandler } from "./ContextMenu/ContextMenuHandler";
import { ContextMenuTouchHandler } from "./ContextMenu/ContextMenuTouchHandler";
import { VisualizerManager } from "./Visualizers/VisualizersManager";
import { VisualizerTouchManager } from "./Visualizers/VisualizersTouchManager";
import { ContextToolboxHandler } from "./ContextToolboxHandler";
import { Browser } from "@devexpress/utils/lib/browser";
import { ConnectorPosition } from "../Model/Connectors/Connector";
import { ConnectionTargetInfo } from "./Visualizers/ConnectionTargetVisualizer";
import { ContainerTargetInfo } from "./Visualizers/ContainerTargetVisualizer";
import { KeyCode, ModifierKey } from "@devexpress/utils/lib/utils/key";
import { IReadOnlyChangesListener } from "../Settings";

export class EventManager implements IEventManager {
    control: DiagramControl;
    mouseHandler: MouseHandler;
    textInputHandler: TextInputHandler;
    contextMenuHandler: ContextMenuHandler;
    contextToolboxHandler: ContextToolboxHandler;
    visualizersManager: VisualizerManager;

    onMouseOperation: EventDispatcher<IMouseOperationsListener> = new EventDispatcher();
    onTextInputOperation: EventDispatcher<ITextInputOperationListener> = new EventDispatcher();

    private draggingEvent: DiagramDraggingEvent;
    private toolboxes: Toolbox[] = [];

    get onVisualizersUpdate(): EventDispatcher<IVisualizersListener> {
        return this.visualizersManager.onVisualizersUpdate;
    }

    constructor(control: DiagramControl) {
        this.control = control;

        this.visualizersManager = EventUtils.isTouchMode() ?
            new VisualizerTouchManager(control.selection, control.model, this, control.settings) :
            new VisualizerManager(control.selection, control.model, this, control.settings);
        this.onMouseOperation.add(this.visualizersManager);

        this.contextMenuHandler = Browser.TouchUI ?
            new ContextMenuTouchHandler(control.selection) :
            new ContextMenuHandler();
        this.contextMenuHandler.onVisibilityChanged.add(control);
        this.onMouseOperation.add(this.contextMenuHandler);
        this.onTextInputOperation.add(this.contextMenuHandler);

        this.contextToolboxHandler = new ContextToolboxHandler();
        this.contextToolboxHandler.onVisibilityChanged.add(control);
        this.contextToolboxHandler.onVisibilityChanged.add(this.contextMenuHandler);

        this.mouseHandler = new MouseHandler(control.history, control.selection, control.model, this,
            control.settings.readOnly, control.view, this.visualizersManager, this.contextToolboxHandler,
            control.shapeDescriptionManager, control.settings, control.permissionsProvider);
        this.textInputHandler = new TextInputHandler(control);
        this.visualizersManager.onVisualizersUpdate.add(this.mouseHandler);
    }

    registerToolbox(toolbox: Toolbox) {
        this.toolboxes.push(toolbox);
    }
    cleanToolboxes(eventDispatcher: EventDispatcher<IReadOnlyChangesListener>) {
        this.toolboxes.forEach(toolbox => {
            eventDispatcher.remove(toolbox);
        });
        this.toolboxes = [];
    }
    initialize() {
        this.visualizersManager.initialize(this.control.model);
        this.mouseHandler.initialize(this.control.model);
    }

    beginUpdate(lockUpdateCanvas?: boolean) {
        this.contextMenuHandler.beginUpdate();
        this.visualizersManager.beginUpdate();
    }
    endUpdate() {
        this.contextMenuHandler.endUpdate();
        this.visualizersManager.endUpdate();
    }

    onMouseDown(evt: DiagramMouseEvent) {
        this.mouseHandler.onMouseDown(evt);
        this.contextMenuHandler.onMouseDown(evt);
        this.visualizersManager.onMouseDown(evt);

        this.contextToolboxHandler.onMouseDown(evt);
    }
    onMouseMove(evt: DiagramMouseEvent) {
        this.processDragging(evt);
        this.mouseHandler.onMouseMove(evt);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        this.contextToolboxHandler.onMouseUp(evt);

        this.mouseHandler.onMouseUp(evt);
        this.contextMenuHandler.onMouseUp(evt);
        this.visualizersManager.onMouseUp(evt);
        this.processDragging(evt);
    }
    onMouseEnter(evt: DiagramEvent) {
        this.visualizersManager.onMouseEnter(evt);
    }
    onMouseLeave(evt: DiagramEvent) {
        this.visualizersManager.onMouseLeave(evt);
    }
    onDblClick(evt: DiagramMouseEvent) {
        this.mouseHandler.onMouseDblClick(evt);
        this.textInputHandler.onDblClick(evt);
        this.control.apiController.notifyDblClick(evt);
    }
    onClick(evt: DiagramMouseEvent) {
        this.mouseHandler.onMouseClick(evt);
        this.control.apiController.notifyClick(evt);
    }
    onContextMenu(evt: DiagramContextMenuEvent) {
        this.contextMenuHandler.onContextMenu(evt);
    }
    onLongTouch(evt: DiagramMouseEvent) {
        this.mouseHandler.onLongTouch(evt);
        this.contextMenuHandler.onLongTouch(evt);
    }
    onBlur(evt: DiagramFocusEvent) {
        this.contextMenuHandler.onBlur(evt);
        this.contextToolboxHandler.onBlur(evt);
        this.visualizersManager.onBlur(evt);
    }
    onFocus(evt: DiagramEvent) {
        this.contextMenuHandler.onFocus(evt);
        this.contextToolboxHandler.onFocus(evt);
        this.visualizersManager.onFocus(evt);
    }
    onKeyDown(evt: DiagramKeyboardEvent): void {
        const scCode = evt.getShortcutCode();
        if(this.onShortcut(scCode)) {
            this.visualizersManager.updateConnectionPoints();
            this.contextMenuHandler.onShortcut(evt);
            this.contextToolboxHandler.onShortcut(evt);
            evt.preventDefault = true;
        }
        else if(this.isShortcutForFocusInput(scCode))
            evt.preventDefault = true;

        this.contextMenuHandler.onKeyDown(evt);
        this.contextToolboxHandler.onKeyDown(evt);
        this.mouseHandler.onKeyDown(evt);
    }
    onKeyUp(evt: DiagramKeyboardEvent): void {
        this.mouseHandler.onKeyUp(evt);
    }
    onTextInputBlur(evt: DiagramFocusEvent) {
        this.textInputHandler.onBlur(evt);
        this.contextMenuHandler.onTextInputBlur(evt);
    }
    onTextInputFocus(evt: DiagramEvent) {
        this.textInputHandler.onFocus(evt);
        this.contextMenuHandler.onTextInputFocus(evt);
    }
    onTextInputKeyDown(evt: DiagramKeyboardEvent) {
        this.textInputHandler.onKeyDown(evt);
    }

    onShortcut(code: number) {
        if(this.control.commandManager.processShortcut(code))
            return true;
        if(this.mouseHandler.onShortcut(code))
            return true;
    }
    isShortcutForFocusInput(code: number) { 
        return code === KeyCode.Delete || code === (KeyCode.Delete | ModifierKey.Ctrl) || code === (KeyCode.Delete | ModifierKey.Meta) ||
        (code === KeyCode.Backspace) || code === (KeyCode.Backspace | ModifierKey.Ctrl) || code === (KeyCode.Backspace | ModifierKey.Shift) || code === (KeyCode.Backspace | ModifierKey.Meta) ||
        code === KeyCode.Home || code === KeyCode.End ||
        code === KeyCode.Up || code === (KeyCode.Up | ModifierKey.Ctrl) || code === (KeyCode.Up | ModifierKey.Meta) ||
        code === KeyCode.Down || code === (KeyCode.Down | ModifierKey.Ctrl) || code === (KeyCode.Down | ModifierKey.Meta) ||
        code === KeyCode.Left || code === (KeyCode.Left | ModifierKey.Ctrl) || code === (KeyCode.Left | ModifierKey.Meta) ||
        code === KeyCode.Right || code === (KeyCode.Right | ModifierKey.Ctrl) || code === (KeyCode.Right | ModifierKey.Meta);
    }
    onPaste(evt: DiagramClipboardEvent) {
        if(!this.textInputHandler.isTextInputActive() && this.control.commandManager.processPaste(evt.clipboardData)) {
            this.visualizersManager.updateConnectionPoints();
            evt.preventDefault = true;
        }
    }
    onMouseWheel(evt: DiagramWheelEvent) {
        if(this.mouseHandler.onWheel(evt))
            evt.preventDefault = true;
    }
    isFocused(): boolean {
        return this.control.isFocused();
    }

    private processDragging(evt: DiagramMouseEvent) {
        const draggingEvt = this.getDraggingEvent();
        if(draggingEvt && this.draggingEvent !== draggingEvt) {
            this.draggingEvent = draggingEvt;
            this.mouseHandler.onDragStart(this.draggingEvent);
            this.control.captureFocus();
        }
        else if(!draggingEvt && this.draggingEvent) {
            delete this.draggingEvent;
            this.mouseHandler.onDragEnd(evt);
        }
    }
    private getDraggingEvent(): DiagramDraggingEvent {
        return this.toolboxes
            .filter(t => t.draggingObject)
            .map(t => t.draggingObject.evt)[0];
    }

    onDocumentDragStart(itemKeys: ItemKey[]) {
        this.control.beginUpdate();
        this.control.captureFocus();
        this.onMouseOperation.raise("notifyDragStart", itemKeys);
    }
    onDocumentDragEnd(itemKeys: ItemKey[]) {
        this.onMouseOperation.raise("notifyDragEnd", itemKeys);
        this.control.endUpdate();
        this.control.barManager.updateItemsState();
    }
    onDocumentDragScrollStart() {
        this.onMouseOperation.raise1(l => l.notifyDragScrollStart());
    }
    onDocumentDragScrollEnd() {
        this.onMouseOperation.raise1(l => l.notifyDragScrollEnd());
    }
    onDocumentClick(itemKeys: ItemKey[]) {
        this.control.beginUpdate();
        this.control.endUpdate();
        this.control.barManager.updateItemsState();
    }
    raiseTextInputStart(item: DiagramItem, text: string, position: Point, size?: Size): void {
        this.onTextInputOperation.raise("notifyTextInputStart", item, text, position, size);
    }
    raiseTextInputEnd(item: DiagramItem, captureFocus?: boolean): void {
        this.onTextInputOperation.raise("notifyTextInputEnd", item, captureFocus);
    }
    raiseTextInputPermissionsCheck(item: DiagramItem, allowed: boolean): void {
        this.onTextInputOperation.raise("notifyTextInputPermissionsCheck", item, allowed);
    }

    canFinishTextEditing(): boolean {
        return this.textInputHandler.canFinishTextEditing();
    }
}

export interface IEventManager {
    onMouseDown(evt: DiagramMouseEvent);
    onMouseMove(evt: DiagramMouseEvent);
    onMouseUp(evt: DiagramMouseEvent);
    onMouseEnter(evt: DiagramEvent);
    onMouseLeave(evt: DiagramEvent);
    onMouseWheel(evt: DiagramWheelEvent);
    onDblClick(evt: DiagramMouseEvent);
    onClick(evt: DiagramMouseEvent);

    onContextMenu(evt: DiagramContextMenuEvent);

    onLongTouch(evt: DiagramMouseEvent);

    onBlur(evt: DiagramFocusEvent);
    onFocus(evt: DiagramEvent);
    onKeyDown(evt: DiagramKeyboardEvent);
    onKeyUp(evt: DiagramKeyboardEvent);
    onTextInputKeyDown(evt: DiagramKeyboardEvent);
    onTextInputBlur(evt: DiagramFocusEvent);
    onTextInputFocus(evt: DiagramEvent);

    onPaste(evt: DiagramClipboardEvent);

    onDocumentDragStart(itemKeys: ItemKey[]);
    onDocumentDragEnd(itemKeys: ItemKey[]);

    onDocumentDragScrollStart();
    onDocumentDragScrollEnd();

    onDocumentClick(itemKeys: ItemKey[]);

    isFocused(): boolean;

    canFinishTextEditing(): boolean;
}

export interface IVisualizersListener {
    notifySelectionRectShow(rect: Rectangle);
    notifySelectionRectHide();
    notifyResizeInfoShow(point: Point, text: string);
    notifyResizeInfoHide();
    notifyConnectionPointsShow(key: ItemKey, points: ConnectionPointInfo[], activePointIndex: number, outsideRectangle: Rectangle);
    notifyConnectionPointsHide();
    notifyConnectionTargetShow(key: ItemKey, info: ConnectionTargetInfo);
    notifyConnectionTargetHide();
    notifyContainerTargetShow(key: ItemKey, info: ContainerTargetInfo);
    notifyContainerTargetHide();
    notifyExtensionLinesShow(lines: ExtensionLine[]);
    notifyExtensionLinesHide();
}

export interface IConnectionChangeOperationParams {
    item?: DiagramItem;
    oldItem?: DiagramItem;
    position: ConnectorPosition;
    connectionPointIndex: number;
}
