import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { HistoryItem } from "../HistoryItem";

export class DeleteShapeHistoryItem extends HistoryItem {
    shapeKey: ItemKey;
    allowed: boolean;
    private shape: Shape;

    constructor(shapeKey: ItemKey, allowed: boolean = true) {
        super();
        this.shapeKey = shapeKey;
        this.allowed = allowed;
    }
    redo(manipulator: ModelManipulator): void {
        const shape = manipulator.model.findShape(this.shapeKey);
        this.shape = shape.clone();
        manipulator.deleteShape(shape, this.allowed);
    }
    undo(manipulator: ModelManipulator): void {
        manipulator.addShape(this.shape, this.shape.key);
    }
}
