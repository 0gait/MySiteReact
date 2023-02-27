import { HistoryItem } from "../HistoryItem";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";

export class ResizeShapeHistoryItem extends HistoryItem {
    position: Point;
    size: Size;
    oldPosition: Point;
    oldSize: Size;
    shapeKey: ItemKey;

    constructor(shapeKey: ItemKey, position: Point, size: Size) {
        super();
        this.shapeKey = shapeKey;
        this.position = position;
        this.size = size;
    }
    redo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        this.oldPosition = shape.position.clone();
        this.oldSize = shape.size.clone();
        manipulator.resizeShape(shape, this.position, this.size);
    }
    undo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        manipulator.resizeShape(shape, this.oldPosition, this.oldSize);
    }
}
