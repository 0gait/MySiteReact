import { DiagramMouseEvent } from "../Event";
import { MouseHandlerDefaultState } from "./MouseHandlerDefaultState";
import { ItemKey } from "../../Model/DiagramItem";

export class MouseHandlerDefaultTouchState extends MouseHandlerDefaultState {
    updateConnectionsOnMouseMove(evt: DiagramMouseEvent) {
    }
    canDragObjectOnMouseDown(key: ItemKey): boolean {
        return this.inSelection(key);
    }
    canExpandContainerOnMouseDown(key: ItemKey): boolean {
        return true;
    }
    canClearSelectionOnMouseDown(): boolean {
        return true;
    }
    canSelectOnMouseUp(key: ItemKey): boolean {
        return !this.inSelection(key);
    }
    canClearSelectionOnMouseUp(): boolean {
        return false;
    }
}
