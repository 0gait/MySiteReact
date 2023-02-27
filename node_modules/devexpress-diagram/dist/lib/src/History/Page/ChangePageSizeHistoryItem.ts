import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class ChangePageSizeHistoryItem extends HistoryItem {
    size: Size;
    oldSize: Size;

    constructor(size: Size) {
        super();
        this.size = size;
    }
    redo(manipulator: ModelManipulator) {
        this.oldSize = manipulator.model.pageSize;
        manipulator.changePageSize(this.size);
    }
    undo(manipulator: ModelManipulator) {
        manipulator.changePageSize(this.oldSize);
    }
}
