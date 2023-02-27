import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ChangeStyleHistoryItemBase } from "./ChangeStyleHistoryItemBase";

export class ChangeStyleHistoryItem extends ChangeStyleHistoryItemBase {
    constructor(itemKey: ItemKey, styleProperty: string, styleValue: string) {
        super(itemKey, styleProperty, styleValue);
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        this.oldStyleValue = item.style[this.styleProperty];
        manipulator.changeStyle(item, this.styleProperty, this.styleValue);
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.changeStyle(item, this.styleProperty, this.oldStyleValue);
    }
}
