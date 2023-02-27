import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { ItemKey } from "../../Model/DiagramItem";

export class ChangeShapeTextHistoryItem extends HistoryItem {
    shapeKey: ItemKey;
    text: string;
    oldText: string;

    constructor(item: Shape, text: string) {
        super();
        this.shapeKey = item.key;
        this.text = text;
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findShape(this.shapeKey);
        this.oldText = item.text;
        manipulator.changeShapeText(item, this.text);
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findShape(this.shapeKey);
        manipulator.changeShapeText(item, this.oldText);
    }
}
