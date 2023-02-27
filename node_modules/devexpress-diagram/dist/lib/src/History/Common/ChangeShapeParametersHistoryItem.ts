import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ShapeParameters } from "../../Model/Shapes/ShapeParameters";
import { ItemKey } from "../../Model/DiagramItem";

export class ChangeShapeParametersHistoryItem extends HistoryItem {
    parameters: ShapeParameters;
    oldParameters: ShapeParameters;
    shapeKey: ItemKey;

    constructor(shapeKey: ItemKey, parameters: ShapeParameters) {
        super();
        this.shapeKey = shapeKey;
        this.parameters = parameters;
    }
    redo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        this.oldParameters = shape.parameters.clone();
        manipulator.changeShapeParameters(shape, this.parameters);
    }
    undo(manipulator: ModelManipulator) {
        const shape = manipulator.model.findShape(this.shapeKey);
        manipulator.changeShapeParameters(shape, this.oldParameters);
    }
}
