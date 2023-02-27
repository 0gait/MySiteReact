import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";

export class ChangePageColorHistoryItem extends HistoryItem {
    value: number;
    oldValue: number;

    constructor(value: number) {
        super();
        this.value = value;
    }
    redo(manipulator: ModelManipulator) {
        this.oldValue = manipulator.model.pageColor;
        manipulator.changePageColor(this.value);
    }
    undo(manipulator: ModelManipulator) {
        manipulator.changePageColor(this.oldValue);
    }
}
