import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey, DiagramItem } from "../../Model/DiagramItem";

export class RemoveFromContainerHistoryItem extends HistoryItem {
    containerKey: ItemKey;
    itemKey: ItemKey;

    constructor(item: DiagramItem) {
        super();
        this.itemKey = item.key;
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        this.containerKey = item.container && item.container.key;
        manipulator.removeFromContainer(item);
    }
    undo(manipulator: ModelManipulator) {
        const container = manipulator.model.findContainer(this.containerKey);
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.insertToContainer(item, container);
    }
}
