import { DiagramMouseEvent } from "../Event";
import { MouseHandlerDefaultStateBase } from "./MouseHandlerDefaultStateBase";
import { ItemKey } from "../../Model/DiagramItem";

export class MouseHandlerDefaultReadOnlyState extends MouseHandlerDefaultStateBase {
    canDragObjectOnMouseDown(key: ItemKey): boolean {
        return false;
    }
    canExpandContainerOnMouseDown(key: ItemKey): boolean {
        return false;
    }
    canClearSelectionOnMouseDown(): boolean {
        return false;
    }
    canSelectOnMouseUp(key: ItemKey): boolean {
        return true;
    }
    canClearSelectionOnMouseUp(): boolean {
        return true;
    }
    updateConnectionsOnMouseMove(evt: DiagramMouseEvent) {
    }
}
