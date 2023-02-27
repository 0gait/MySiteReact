import { EventDispatcher } from "../../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramMouseEvent, DiagramContextMenuEvent, DiagramFocusEvent, DiagramEvent, MouseEventElementType, IMouseOperationsListener, DiagramKeyboardEvent, MouseButton, ITextInputOperationListener } from "../Event";
import { ItemKey, ConnectionPointSide, DiagramItem } from "../../Model/DiagramItem";
import { KeyCode } from "@devexpress/utils/lib/utils/key";
import { IContextToolboxVisibilityChangesListener } from "../ContextToolboxHandler";
import { BatchUpdatableObject } from "@devexpress/utils/lib/class/batch-updatable";
import { Browser } from "@devexpress/utils/lib/browser";
import { Shape } from "../../Model/Shapes/Shape";
import { Size } from "@devexpress/utils/lib/geometry/size";

export interface IContextMenuVisibilityChangesListener {
    notifyShowContextMenu(eventPoint: Point, modelPoint: Point);
    notifyHideContextMenu();
}

export class ContextMenuHandler extends BatchUpdatableObject implements IMouseOperationsListener,
    IContextToolboxVisibilityChangesListener, ITextInputOperationListener {
    protected contextMenuVisible = false;
    protected textInputStarted = false;
    private canHideContextMenu = true;
    onVisibilityChanged: EventDispatcher<IContextMenuVisibilityChangesListener> = new EventDispatcher();

    onMouseDown(evt: DiagramMouseEvent) {
        if(evt.button === MouseButton.Left && evt.source.type !== MouseEventElementType.Undefined)
            this.hideContextMenu();

    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(!Browser.MacOSPlatform || Browser.MacOSPlatform && this.canHideContextMenu)
            this.hideContextMenu();

        this.canHideContextMenu = true;
    }
    onContextMenu(evt: DiagramContextMenuEvent) {
        if(Browser.MacOSPlatform)
            this.canHideContextMenu = false;
        this.showContextMenu(evt.eventPoint, evt.modelPoint);
    }
    onFocus(evt: DiagramEvent) { }
    onBlur(evt: DiagramFocusEvent) { }
    onTextInputFocus(evt: DiagramEvent) { }
    onTextInputBlur(evt: DiagramFocusEvent) { }
    onLongTouch(evt: DiagramMouseEvent) { }
    onKeyDown(evt: DiagramKeyboardEvent) {
        if(evt.keyCode === KeyCode.Esc)
            this.hideContextMenu();
    }
    onShortcut(evt: DiagramKeyboardEvent) {
        this.hideContextMenu();
    }

    showContextMenu(eventPoint: Point, modelPoint: Point) {
        if(this.textInputStarted) return;

        window.setTimeout(()=>{ 
            this.onVisibilityChanged.raise1(l => l.notifyShowContextMenu(eventPoint, modelPoint));
            this.contextMenuVisible = true;
        }, 0);
    }
    hideContextMenu() {
        if(this.contextMenuVisible)
            window.setTimeout(()=>{ 
                this.onVisibilityChanged.raise1(l => l.notifyHideContextMenu());
                this.contextMenuVisible = false;
            }, 0);
    }

    notifyDragStart(itemKeys: ItemKey[]) { }
    notifyDragEnd(itemKeys: ItemKey[]) { }
    notifyDragScrollStart() {}
    notifyDragScrollEnd() {}

    notifyShowContextToolbox(modelPoint: Point, getPositionToInsertShapeTo: (shape: Shape) => Point, side: ConnectionPointSide, category: string, callback: (shapeType: string) => void) { }
    notifyHideContextToolbox() { }

    notifyTextInputStart(item: DiagramItem, text: string, position: Point, size?: Size) {
        this.textInputStarted = true;
    }
    notifyTextInputEnd(item: DiagramItem, captureFocus?: boolean) {
        this.textInputStarted = false;
    }
    notifyTextInputPermissionsCheck(item: DiagramItem, allowed: boolean): void {}

    onUpdateUnlocked(occurredEvents: number) { }
}
