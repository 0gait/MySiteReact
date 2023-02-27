import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";
import { ObjectUtils } from "../../Utils";

export class ChangeCustomDataHistoryItem extends HistoryItem {
    itemKey: ItemKey;
    customData: any;
    oldCustomData: boolean;

    constructor(itemKey: ItemKey, customData: unknown) {
        super();
        this.itemKey = itemKey;
        this.customData = ObjectUtils.cloneObject(customData);
    }
    redo(manipulator: ModelManipulator): void {
        const item = manipulator.model.findItem(this.itemKey);
        this.oldCustomData = ObjectUtils.cloneObject(item.customData);
        manipulator.changeCustomData(item, this.customData);
    }
    undo(manipulator: ModelManipulator): void {
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.changeCustomData(item, this.oldCustomData);
    }
}
