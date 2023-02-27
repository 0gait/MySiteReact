import { IHistory } from "./IHistory";
import { HistoryItemInfo } from "./HistoryItems/HistoryItemInfo";
import { CompositionHistoryItem } from "./HistoryItems/CompositionHistoryItem";
import { HistoryItem } from "./HistoryItems/HistoryItem";
import { IHistoryListener } from "../../Interfaces/IHistiryListener";

export class History implements IHistory {
    private static MAX_HISTORY_ITEM_COUNT: number = 100;
    historyItems: HistoryItem[] = [];
    currentIndex: number = -1;
    currentProcessingItemInfo: HistoryItemInfo = null;
    transaction: CompositionHistoryItem = null;

    private transactionLevel: number = -1;
    private _listener: IHistoryListener;
    constructor(listener?: IHistoryListener) {
        this._listener = listener;
    }

    public undo(): void {
        if(this.canUndo()) {
            this.activateItem(this.historyItems[this.currentIndex], true);
            this.currentIndex--;
        }
    }
    public redo(): void {
        if(this.canRedo()) {
            this.currentIndex++;
            this.activateItem(this.historyItems[this.currentIndex]);
        }
    }
    public beginTransaction(): void {
        this.transactionLevel++;
        if(this.transactionLevel == 0) {
            this.transaction = new CompositionHistoryItem();
            this._listener?.onTransactionStart();
        }
    }
    public endTransaction(): void {
        if(--this.transactionLevel >= 0)
            return;

        const transactionLength: number = this.transaction.historyItems.length;
        if(transactionLength > 1)
            this.addInternal(this.transaction);
        else if(transactionLength == 1)
            this.addInternal(this.transaction.historyItems.pop());
        this.transaction = null;
        this._listener?.onTransactionEnd();
    }
    public addAndRedo(historyItem: HistoryItem): void {
        this.add(historyItem);
        this.activateItem(historyItem);
    }
    public add(historyItem: HistoryItem): void {
        if(this.transactionLevel >= 0)
            this.transaction.add(historyItem);
        else
            this.addInternal(historyItem);
    }
    public canUndo(): boolean {
        return this.currentIndex >= 0;
    }
    public canRedo(): boolean {
        return this.currentIndex < this.historyItems.length - 1;
    }

    private addInternal(historyItem: HistoryItem) {
        if(this.currentIndex < this.historyItems.length - 1)
            this.historyItems.splice(this.currentIndex + 1);
        this.historyItems.push(historyItem);
        this.currentIndex++;
        this.deleteOldItems();
    }
    private deleteOldItems() {
        const exceedItemsCount: number = this.historyItems.length - History.MAX_HISTORY_ITEM_COUNT;
        if(exceedItemsCount > 0 && this.currentIndex > exceedItemsCount) {
            this.historyItems.splice(0, exceedItemsCount);
            this.currentIndex -= exceedItemsCount;
        }
    }
    public clear(): void {
        this.currentIndex = -1;
        this.historyItems = [];
    }
    activateItem(historyItem: HistoryItem, isUndo: boolean = false): void {
        this.currentProcessingItemInfo = new HistoryItemInfo(historyItem, isUndo);
        if(isUndo)
            historyItem.undo();
        else
            historyItem.redo();
        this.currentProcessingItemInfo = null;
    }
    getCurrentProcessingItemInfo(): HistoryItemInfo {
        return this.currentProcessingItemInfo;
    }
    rollBackAndRemove(info: HistoryItemInfo): void {
        const item = info.item;
        if(!this.checkAndRemoveItem(item)) return;

        if(info.isUndo)
            item.redo();
        else if(item instanceof CompositionHistoryItem)
            (item as CompositionHistoryItem).undoItemsQuery();
        else
            item.undo();
    }
    checkAndRemoveItem(item: HistoryItem): boolean {
        let index = this.historyItems.indexOf(item);
        if(index > -1) {
            this.historyItems.splice(index, 1);
            this.currentIndex--;
        }
        else if(this.transaction) {
            index = this.transaction.historyItems.indexOf(item);
            if(index > -1)
                this.transaction.historyItems.splice(index, 1);
        }

        return index > -1;
    }
    public updateObsoleteInsertedKey(oldKey: string, newKey: string, type: string): void {
        if(this.transaction)
            this.updateItemsObsoleteInsertedKey(oldKey, newKey, type, [ this.transaction ]);
        this.updateItemsObsoleteInsertedKey(oldKey, newKey, type, this.historyItems);
    }
    updateItemsObsoleteInsertedKey(oldKey: string, newKey: string, type: string, historyItems: HistoryItem[]): void {
        if(historyItems)
            for(let i = 0; i < historyItems.length; i++) {
                const item = historyItems[i];
                const keyUpdaters = item.keyUpdaters.filter(k => k.getKey() === oldKey && k.objectType === type);
                keyUpdaters.forEach(k => k.updateKey(newKey));
                if(item instanceof CompositionHistoryItem)
                    this.updateItemsObsoleteInsertedKey(oldKey, newKey, type, item.historyItems);
            }
    }
}
