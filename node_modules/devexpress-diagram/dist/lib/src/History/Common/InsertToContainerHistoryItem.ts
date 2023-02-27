import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { ItemKey, DiagramItem } from "../../Model/DiagramItem";

export class InsertToContainerHistoryItem extends HistoryItem {
    containerKey: ItemKey;
    itemKey: ItemKey;

    constructor(item: DiagramItem, container: Shape) {
        super();
        this.containerKey = container.key;
        this.itemKey = item.key;
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        const container = manipulator.model.findShape(this.containerKey);
        manipulator.insertToContainer(item, container);
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.removeFromContainer(item);
    }
}
