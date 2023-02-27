import { HistoryItem } from "../HistoryItem";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { ItemKey, ItemDataKey } from "../../Model/DiagramItem";
import { ShapeDescription } from "../../Model/Shapes/Descriptions/ShapeDescription";

export class AddShapeHistoryItem extends HistoryItem {
    private shapeDescription: ShapeDescription;
    private position: Point;
    shapeKey: ItemKey;
    private text: string;
    private dataKey: ItemDataKey;

    constructor(shapeDescription: ShapeDescription, position: Point, text?: string, dataKey?: ItemDataKey) {
        super();
        this.shapeDescription = shapeDescription;
        this.position = position;
        this.text = text;
        this.dataKey = dataKey;
    }
    redo(manipulator: ModelManipulator) {
        const shape = new Shape(this.shapeDescription, this.position);
        if(typeof this.text === "string")
            shape.text = this.text;
        if(this.dataKey !== undefined)
            shape.dataKey = this.dataKey;
        manipulator.addShape(shape, this.shapeKey);
        this.shapeKey = shape.key;
    }
    undo(manipulator: ModelManipulator) {
        manipulator.deleteShape(manipulator.model.findShape(this.shapeKey), true);
    }
}
