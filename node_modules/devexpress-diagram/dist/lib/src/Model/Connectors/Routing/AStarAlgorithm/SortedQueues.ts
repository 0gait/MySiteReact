import { SearchUtils } from "@devexpress/utils/lib/utils/search";

export class SortedQueues<T> {
    private _itemsArrays: { [key: number]: T[] } = {};
    private _sortedKeys: number[] = [];
    constructor(private getKey: (item: T) => number) { }

    get sortedKeys(): number[] { return this._sortedKeys; }

    getQueue(key: number): T[] {
        return this._itemsArrays[key];
    }
    enqueue(item: T): void {
        const key = this.getKey(item);
        if(this._itemsArrays[key] === undefined) {
            this._itemsArrays[key] = [item];
            this.addSortedKey(key);
        }
        else
            this._itemsArrays[key].push(item);
    }
    remove(item: T): void {
        const key = this.getKey(item);
        const itemsArray = this._itemsArrays[key];
        if(itemsArray !== undefined)
            if(!itemsArray.length)
                this.removeCore(key);
            else
            if(itemsArray[0] === item) {
                itemsArray.shift();
                if(!itemsArray.length)
                    this.removeCore(key);
            }
            else
                this._itemsArrays[key] = itemsArray.filter(x => x !== item);


    }
    dequeueMin(): T {
        if(!this._sortedKeys.length)
            return undefined;
        const key = this._sortedKeys[0];
        const itemsArray = this._itemsArrays[key];
        const item = itemsArray.shift();
        if(!itemsArray.length)
            this.removeCore(key);
        return item;
    }
    private removeCore(key: number) {
        delete this._itemsArrays[key];
        this.removeSortedKey(key);
    }
    private removeSortedKey(key: number) {
        const sortedPointIndex = SearchUtils.binaryIndexOf(this._sortedKeys, x => x - key);
        if(sortedPointIndex >= 0)
            this.sortedKeys.splice(sortedPointIndex, 1);
    }
    private addSortedKey(key: number) {
        const sortedPointIndex = SearchUtils.binaryIndexOf(this._sortedKeys, x => x - key);
        if(sortedPointIndex < 0)
            this._sortedKeys.splice(-(sortedPointIndex + 1), 0, key);
    }
}
