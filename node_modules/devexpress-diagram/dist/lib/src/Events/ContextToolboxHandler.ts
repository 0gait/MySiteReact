import { DiagramMouseEvent, DiagramFocusEvent, DiagramEvent, MouseEventElementType, DiagramKeyboardEvent } from "./Event";
import { EventDispatcher } from "../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ConnectionPointSide } from "../Model/DiagramItem";
import { KeyCode } from "@devexpress/utils/lib/utils/key";
import { Browser } from "@devexpress/utils/lib/browser";
import { Shape } from "../Model/Shapes/Shape";

export interface IContextToolboxVisibilityChangesListener {
    notifyShowContextToolbox(modelPoint: Point, getPositionToInsertShapeTo: (shape: Shape) => Point, side: ConnectionPointSide, category: string, callback: (shapeType: string) => void);
    notifyHideContextToolbox();
}

export interface IContextToolboxHandler {
    showContextToolbox(modelPoint: Point, getPositionToInsertShapeTo: (shape: Shape) => Point, side: ConnectionPointSide, category: string,
        applyCallback: (shapeType: string) => void, cancelCallback: () => void);
    hideContextToolbox(applyed?: boolean);
}

export class ContextToolboxHandler implements IContextToolboxHandler {
    protected contextToolboxVisible = false;
    protected contextToolboxCancelCallback: () => void;
    onVisibilityChanged: EventDispatcher<IContextToolboxVisibilityChangesListener> = new EventDispatcher();

    onMouseDown(evt: DiagramMouseEvent) {
        if(evt.source.type !== MouseEventElementType.Undefined)
            this.hideContextToolbox();
    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(evt.source.type !== MouseEventElementType.Undefined || !Browser.TouchUI)
            this.hideContextToolbox();
    }
    onFocus(evt: DiagramEvent) { }
    onBlur(evt: DiagramFocusEvent) { }
    onKeyDown(evt: DiagramKeyboardEvent) {
        if(evt.keyCode === KeyCode.Esc)
            this.hideContextToolbox();
    }
    onShortcut(evt: DiagramKeyboardEvent) {
        this.hideContextToolbox();
    }

    showContextToolbox(modelPoint: Point, getPositionToInsertShapeTo: (shape: Shape) => Point, side: ConnectionPointSide, category: string,
        applyCallback: (shapeType: string) => void, cancelCallback: () => void): void {
        this.onVisibilityChanged.raise1(l => l.notifyShowContextToolbox(modelPoint, getPositionToInsertShapeTo, side, category, applyCallback));
        this.contextToolboxVisible = true;
        this.contextToolboxCancelCallback = cancelCallback;
    }
    hideContextToolbox(applyed?: boolean): void {
        if(this.contextToolboxVisible) {
            this.onVisibilityChanged.raise1(l => l.notifyHideContextToolbox());
            if(this.contextToolboxCancelCallback) {
                if(!applyed)
                    this.contextToolboxCancelCallback();
                this.contextToolboxCancelCallback = undefined;
            }
            this.contextToolboxVisible = false;
        }
    }
}
