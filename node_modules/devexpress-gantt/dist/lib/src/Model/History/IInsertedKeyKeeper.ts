export interface IDataObjectKeyUpdater {
    getKey(): string;
    updateKey(value: string): void;
    objectType: string;
}
