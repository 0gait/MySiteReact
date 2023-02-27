import { HistoryItem } from "../HistoryItem";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";

export class MoveShapeHistoryItem extends HistoryItem {
    position: Point;
    oldPosition: Point;
    shapeKey: ItemKey;

    constructor(shapeKey: ItemKey, position: Point) {
        super();
        this.shapeKey = shapeKey;
        this.position = position;
    }
    redo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        this.oldPosition = shape.position.clone();
        manipulator.moveShape(shape, this.position);
    }
    undo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        manipulator.moveShape(shape, this.oldPosition);
    }
}
