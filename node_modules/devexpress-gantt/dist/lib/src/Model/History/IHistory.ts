import { HistoryItem } from "./HistoryItems/HistoryItem";
import { HistoryItemInfo } from "./HistoryItems/HistoryItemInfo";

export interface IHistory {
    undo: () => void;
    redo: () => void;
    clear: () => void;
    add: (historyItem: HistoryItem) => void;
    addAndRedo: (historyItem: HistoryItem) => void;
    beginTransaction: () => void;
    endTransaction: () => void;
    historyItems: HistoryItem[];
    canUndo: () => boolean;
    canRedo: () => boolean;

    getCurrentProcessingItemInfo: () => HistoryItemInfo;
    rollBackAndRemove: (info: HistoryItemInfo) => void;
    updateObsoleteInsertedKey: (oldKey: string, newKey: string, type: string) => void;
}
