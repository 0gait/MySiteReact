import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Offsets } from "@devexpress/utils/lib/geometry/offsets";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class ModelResizeHistoryItem extends HistoryItem {
    offset: Offsets;
    backOffset: Offsets;
    oldSize: Size;

    constructor(offset: Offsets) {
        super();
        this.offset = offset;
    }
    redo(manipulator: ModelManipulator) {
        this.oldSize = manipulator.model.size.clone();
        this.backOffset = new Offsets(-this.offset.left, -this.offset.right, -this.offset.top, -this.offset.bottom);
        const newWidth = Math.max(this.oldSize.width + this.offset.left + this.offset.right, manipulator.model.pageWidth);
        const newHeight = Math.max(this.oldSize.height + this.offset.top + this.offset.bottom, manipulator.model.pageHeight);
        manipulator.changeModelSize(new Size(newWidth, newHeight), this.offset);
    }
    undo(manipulator: ModelManipulator) {
        manipulator.changeModelSize(this.oldSize, this.backOffset);
    }
}
