import { ModelManipulator } from "../../Manipulators/ModelManipulator";
import { HistoryItem } from "./HistoryItem";

export class CompositionHistoryItem extends HistoryItem {
    historyItems: HistoryItem[] = [];
    constructor() {
        super(null);
    }
    public redo(): void {
        let item: HistoryItem;
        for(let i = 0; item = this.historyItems[i]; i++)
            item.redo();
    }
    public undo(): void {
        let item: HistoryItem;
        for(let i = this.historyItems.length - 1; item = this.historyItems[i]; i--)
            item.undo();
    }
    public add(historyItem: HistoryItem): void {
        if(historyItem == null)
            throw new Error("Can't add null HistoryItem");
        this.historyItems.push(historyItem);
    }
    public undoItemsQuery(): void {
        this.undo();
    }
    public setModelManipulator(modelManipulator: ModelManipulator): void {
        super.setModelManipulator(modelManipulator);
        if(this.historyItems)
            for(let i = 0; i < this.historyItems.length; i++)
                this.historyItems[i].setModelManipulator(modelManipulator);
    }
}
