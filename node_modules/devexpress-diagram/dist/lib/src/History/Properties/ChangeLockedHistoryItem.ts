import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { DiagramItem, ItemKey } from "../../Model/DiagramItem";

export class ChangeLockedHistoryItem extends HistoryItem {
    itemKey: ItemKey;
    locked: boolean;
    oldLocked: boolean;

    constructor(item: DiagramItem, locked: boolean) {
        super();
        this.itemKey = item.key;
        this.locked = locked;
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        this.oldLocked = item.locked;
        manipulator.changeLocked(item, this.locked);
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.changeLocked(item, this.oldLocked);
    }
}
