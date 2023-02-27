import { HistoryItem } from "../HistoryItem";
import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";

export class ChangeStyleHistoryItemBase extends HistoryItem {
    itemKey: ItemKey;
    styleProperty: string;
    styleValue: string;
    oldStyleValue: string;

    constructor(itemKey: ItemKey, styleProperty: string, styleValue: string) {
        super();
        this.itemKey = itemKey;
        this.styleProperty = styleProperty;
        this.styleValue = styleValue;
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
