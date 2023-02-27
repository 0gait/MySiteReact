import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ChangeStyleHistoryItemBase } from "./ChangeStyleHistoryItemBase";

export class ChangeStyleTextHistoryItem extends ChangeStyleHistoryItemBase {
    constructor(itemKey: ItemKey, styleProperty: string, styleValue: string) {
        super(itemKey, styleProperty, styleValue);
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        this.oldStyleValue = item.styleText[this.styleProperty];
        manipulator.changeStyleText(item, this.styleProperty, this.styleValue);
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.changeStyleText(item, this.styleProperty, this.oldStyleValue);
    }
}
