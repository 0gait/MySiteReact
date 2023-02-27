import { HistoryItem } from "./HistoryItem";

export class HistoryItemInfo {
    item: HistoryItem;
    isUndo: boolean;
    constructor(item: HistoryItem, isUndo: boolean = false) {
        this.item = item;
        this.isUndo = isUndo;
    }
}
