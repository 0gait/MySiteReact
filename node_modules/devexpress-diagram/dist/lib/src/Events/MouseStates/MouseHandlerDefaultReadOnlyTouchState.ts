import { MouseHandlerDefaultReadOnlyState } from "./MouseHandlerDefaultReadOnlyState";
import { ItemKey } from "../../Model/DiagramItem";

export class MouseHandlerDefaultReadOnlyTouchState extends MouseHandlerDefaultReadOnlyState {
    canDragObjectOnMouseDown(key: ItemKey): boolean {
        return false;
    }
    canExpandContainerOnMouseDown(key: ItemKey): boolean {
        return false;
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
