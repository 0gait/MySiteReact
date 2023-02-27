import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { ItemKey } from "../../Model/DiagramItem";

export class ImportShapeHistoryItem extends HistoryItem {
    private shape: Shape;
    shapeKey: ItemKey;

    constructor(shape: Shape) {
        super();
        this.shape = shape;
    }
    redo(manipulator: ModelManipulator) {
        this.shapeKey = this.shape.key;
        manipulator.insertShape(this.shape);
    }
    undo(manipulator: ModelManipulator) {
        manipulator.removeShape(manipulator.model.findShape(this.shapeKey), true);
    }
}
