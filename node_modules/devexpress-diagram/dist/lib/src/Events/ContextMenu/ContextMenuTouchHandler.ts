import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramMouseEvent, DiagramFocusEvent, DiagramEvent, MouseEventElementType, DiagramKeyboardEvent } from "../Event";
import { ContextMenuHandler } from "./ContextMenuHandler";
import { Selection, ISelectionChangesListener } from "../../Selection/Selection";
import { ItemKey, ConnectionPointSide } from "../../Model/DiagramItem";
import { Shape } from "../../Model/Shapes/Shape";
import { ModelUtils } from "../../Model/ModelUtils";

const SELECTION_CHANGED_EVENT = 1;

export class ContextMenuTouchHandler extends ContextMenuHandler implements ISelectionChangesListener {
    protected contextToolboxVisible = false;

    constructor(protected selection: Selection) {
        super();
        this.selection.onChanged.add(this);
    }

    onMouseDown(evt: DiagramMouseEvent) {
        if(evt.source.key === undefined)
            this.hideContextMenu();
    }
    onMouseUp(evt: DiagramMouseEvent) {
    }
    onFocus(evt: DiagramEvent) {
        setTimeout(() => { this.showContextMenuAtSelection(); }, 1);
    }
    onBlur(evt: DiagramFocusEvent) {
        setTimeout(() => { this.hideContextMenu(); }, 1);
    }
    onTextInputFocus(evt: DiagramEvent) {
        setTimeout(() => { this.hideContextMenu(); }, 1);
    }
    onTextInputBlur(evt: DiagramFocusEvent) {
        setTimeout(() => { this.showContextMenuAtSelection(); }, 1);
    }
    onLongTouch(evt: DiagramMouseEvent) {
        if(evt.source.type === MouseEventElementType.Document)
            this.showContextMenuAtEmptySelection(evt.modelPoint);
    }
    onKeyDown(evt: DiagramKeyboardEvent) {
    }
    onShortcut(evt: DiagramKeyboardEvent) {
    }

    getSelectedItems() {
        return this.selection.getSelectedItems(true);
    }
    showContextMenuAtSelection() {
        if(this.contextToolboxVisible) return;

        const items = this.getSelectedItems();
        if(items.length !== 0)
            this.showContextMenu(undefined, ModelUtils.createRectangle(items).createPosition());
    }
    showContextMenuAtEmptySelection(point: Point) {
        if(this.contextToolboxVisible) return;

        const items = this.getSelectedItems();
        if(items.length === 0)
            this.showContextMenu(undefined, point);
    }

    notifyDragStart(itemKeys: ItemKey[]) {
        this.hideContextMenu();
    }
    notifyDragEnd(itemKeys: ItemKey[]) {
        this.showContextMenuAtSelection();
    }

    notifySelectionChanged(selection: Selection) {
        if(this.isUpdateLocked())
            this.registerOccurredEvent(SELECTION_CHANGED_EVENT);
        else
            this.raiseSelectionChanged();
    }
    raiseSelectionChanged() {
        const items = this.getSelectedItems();
        if(items.length !== 0)
            this.showContextMenuAtSelection();
        else
            this.hideContextMenu();
    }
    onUpdateUnlocked(occurredEvents: number) {
        if(occurredEvents & SELECTION_CHANGED_EVENT)
            this.raiseSelectionChanged();
    }

    notifyShowContextToolbox(modelPoint: Point, getPositionToInsertShapeTo: (shape: Shape) => Point, side: ConnectionPointSide, category: string, callback: (shapeType: string) => void) {
        this.contextToolboxVisible = true;
        this.hideContextMenu();
    }
    notifyHideContextToolbox() {
        this.contextToolboxVisible = false;
        this.showContextMenuAtSelection();
    }
}
