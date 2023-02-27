import { ModelManipulator } from "../Model/ModelManipulator";

export abstract class HistoryItem {
    uniqueId: number = -1;
    abstract redo(manipulator: ModelManipulator);
    abstract undo(manipulator: ModelManipulator);
    changeModified(): boolean {
        return true;
    }
    getName(): string {
        return this.constructor.name;
    }
}

export class CompositionHistoryItem extends HistoryItem {
    historyItems: HistoryItem[] = [];
    dataSyncItems: HistoryItem[] = [];

    public changeModified(): boolean {
        let item: HistoryItem;
        for(let i = 0; item = this.historyItems[i]; i++)
            if(item.changeModified())
                return true;

        return false;
    }

    public redo(manipulator: ModelManipulator) {
        let item: HistoryItem;
        for(let i = 0; item = this.historyItems[i]; i++)
            item.redo(manipulator);

    }

    public undo(manipulator: ModelManipulator) {
        let item: HistoryItem;

        for(let i = this.dataSyncItems.length - 1; item = this.dataSyncItems[i]; i--)
            item.undo(manipulator);
        this.dataSyncItems = [];


        for(let i = this.historyItems.length - 1; item = this.historyItems[i]; i--)
            item.undo(manipulator);
    }

    public add(historyItem: HistoryItem) {
        if(historyItem == null)
            throw new Error("cannot be null");
        this.historyItems.push(historyItem);
    }
}
