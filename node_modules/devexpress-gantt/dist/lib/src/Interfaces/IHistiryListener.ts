export interface IHistoryListener {
    onTransactionStart(): void;
    onTransactionEnd(): void;
}
