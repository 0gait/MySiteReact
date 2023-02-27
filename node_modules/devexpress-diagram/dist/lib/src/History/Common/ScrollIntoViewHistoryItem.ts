import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { IViewController } from "../../ViewController";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class ScrollIntoViewOnRedoHistoryItem extends HistoryItem {
    constructor(protected view: IViewController, protected rectangle: Rectangle) {
        super();
        this.view = view;
        this.rectangle = rectangle.clone();
    }
    redo(manipulator: ModelManipulator) {
        this.view.scrollIntoView(this.rectangle);
    }
    undo(manipulator: ModelManipulator) { }
}

export class ScrollIntoViewOnUndoHistoryItem extends HistoryItem {
    constructor(protected view: IViewController, protected rectangle: Rectangle) {
        super();
        this.view = view;
        this.rectangle = rectangle.clone();
    }
    redo(manipulator: ModelManipulator) { }
    undo(manipulator: ModelManipulator) {
        this.view.scrollIntoView(this.rectangle);
    }
}
