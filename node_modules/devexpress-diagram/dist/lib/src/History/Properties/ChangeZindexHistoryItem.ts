import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { DiagramItem, ItemKey } from "../../Model/DiagramItem";

export class ChangeZindexHistoryItem extends HistoryItem {
    itemKey: ItemKey;
    zIndex: number;
    oldZIndex: number;

    constructor(item: DiagramItem, zIndex: number) {
        super();
        this.itemKey = item.key;
        this.zIndex = zIndex;
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        this.oldZIndex = item.zIndex;
        manipulator.changeZIndex(item, this.zIndex);
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.changeZIndex(item, this.oldZIndex);
    }
}
