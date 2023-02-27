import { HistoryItem } from "../HistoryItem";
import { Selection } from "../../Selection/Selection";
import { ItemKey } from "../../Model/DiagramItem";

export class SetSelectionHistoryItem extends HistoryItem {
    private selection: Selection;
    private selectedKeys: ItemKey[];
    private oldSelection: ItemKey[];
    private forceChange: boolean;

    constructor(selection: Selection, selectedKeys: ItemKey[], forceChange?: boolean) {
        super();
        this.selectedKeys = selectedKeys;
        this.selection = selection;
        this.forceChange = forceChange;
    }
    redo() {
        this.oldSelection = this.selection.getKeys().slice(0);
        this.selection.set(this.selectedKeys, this.forceChange);
    }
    undo() {
        this.selection.set(this.oldSelection, this.forceChange);
    }
}
