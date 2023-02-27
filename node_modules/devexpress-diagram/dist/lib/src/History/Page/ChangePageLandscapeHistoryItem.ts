import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";

export class ChangePageLandscapeHistoryItem extends HistoryItem {
    value: boolean;
    oldValue: boolean;

    constructor(value: boolean) {
        super();
        this.value = value;
    }
    redo(manipulator: ModelManipulator) {
        this.oldValue = manipulator.model.pageLandscape;
        manipulator.changePageLandscape(this.value);
    }
    undo(manipulator: ModelManipulator) {
        manipulator.changePageLandscape(this.oldValue);
    }
}
