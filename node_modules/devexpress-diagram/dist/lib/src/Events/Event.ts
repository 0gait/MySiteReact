import { ModifierKey } from "@devexpress/utils/lib/utils/key";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramItem, ItemKey } from "../Model/DiagramItem";

export enum MouseButton {
    None = 0,
    Left = 1,
    Right = 2,
    Middle = 4,
}

export enum MouseEventElementType {
    Undefined,
    Background, Document,
    Connector, ConnectorPoint, ConnectorSide, ConnectorOrthogonalSide, ConnectorText,
    Shape, ShapeResizeBox, ShapeParameterBox, SelectionRect, ShapeConnectionPoint, ShapeExpandButton
}

export class MouseEventSource {
    constructor(
        public type?: MouseEventElementType,
        public key?: ItemKey,
        public value?: string) { }
}

export enum ResizeEventSource {
    Undefined,
    ResizeBox_NW,
    ResizeBox_NE,
    ResizeBox_SE,
    ResizeBox_SW,
    ResizeBox_N,
    ResizeBox_E,
    ResizeBox_S,
    ResizeBox_W
}

export interface IMouseOperationsListener {
    notifyDragStart(itemKeys: ItemKey[]);
    notifyDragEnd(itemKeys: ItemKey[]);
    notifyDragScrollStart();
    notifyDragScrollEnd();
}

export interface ITextInputOperationListener {
    notifyTextInputStart(item: DiagramItem, text: string, position: Point, size?: Size);
    notifyTextInputEnd(item: DiagramItem, captureFocus?: boolean);
    notifyTextInputPermissionsCheck(item: DiagramItem, allowed: boolean): void;
}

export class DiagramEvent {
    constructor(public modifiers: ModifierKey) { }
    preventDefault: boolean;
}

export class DiagramFocusEvent extends DiagramEvent {
    constructor(public inputText: string) {
        super(ModifierKey.None);
    }
}

export class DiagramMouseEventTouch {
    constructor(public offsetPoint: Point, public modelPoint: Point) {}
}

export class DiagramMouseEventBase extends DiagramEvent {
    constructor(modifiers: ModifierKey,
        public offsetPoint: Point,
        public modelPoint: Point,
        public source: MouseEventSource) {
        super(modifiers);
    }
}

export class DiagramMouseEvent extends DiagramMouseEventBase {
    scrollX: number = 0;
    scrollY: number = 0;
    constructor(modifiers: ModifierKey,
        public button: MouseButton,
        offsetPoint: Point,
        modelPoint: Point,
        source: MouseEventSource,
        public touches: DiagramMouseEventTouch[] = [],
        public isTouchMode?: boolean) {
        super(modifiers, offsetPoint, modelPoint, source);
    }
}

export class DiagramWheelEvent extends DiagramMouseEventBase {
    constructor(modifiers: ModifierKey,
        public deltaX: number,
        public deltaY: number,
        offsetPoint: Point,
        modelPoint: Point,
        source: MouseEventSource) {
        super(modifiers, offsetPoint, modelPoint, source);
    }
}

export class DiagramContextMenuEvent extends DiagramEvent {
    constructor(modifiers: ModifierKey,
        public eventPoint: Point,
        public modelPoint: Point) {
        super(modifiers);
    }
}

export class DiagramKeyboardEvent extends DiagramEvent {
    constructor(modifiers: ModifierKey,
        public keyCode: number,
        public inputText: string) {
        super(modifiers);
    }
    getShortcutCode() {
        return this.modifiers | this.keyCode;
    }
}

export class DiagramClipboardEvent extends DiagramEvent {
    constructor(public clipboardData: string) {
        super(ModifierKey.None);
    }
}
