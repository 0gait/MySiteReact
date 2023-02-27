import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { ItemKey } from "../../Model/DiagramItem";

export class ToggleShapeExpandedHistoryItem extends HistoryItem {
    shapeKey: ItemKey;
    expanded: boolean;

    constructor(shape: Shape) {
        super();
        this.shapeKey = shape.key;
        this.expanded = shape.expanded;
    }
    redo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        manipulator.changeShapeExpanded(shape, !this.expanded);
    }
    undo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        manipulator.changeShapeExpanded(shape, this.expanded);
    }
}
