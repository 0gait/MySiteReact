import { DataObject } from "../Entities/DataObject";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { GanttJsonUtils } from "../Utils/GanttJsonUtils";

export abstract class CollectionBase<T extends DataObject> {
    private _items: Array<T>;
    private _invertedItems: Record<string, any>;
    private _isGanttCollection: boolean;

    constructor() {
        this._items = new Array<T>();
        this._isGanttCollection = true;
    }

    add(element: T): void {
        if(!isDefined(element)) return;
        if(this.getItemById(element.internalId))
            throw "The collection item with id ='" + element.internalId + "' already exists.";
        this._addItem(element);
    }
    addRange(range: Array<T>): void {
        for(let i = 0; i < range.length; i++)
            this.add(range[i]);
    }
    remove(element: T): void {
        const index = this._items.indexOf(element);
        if(index > -1 && index < this._items.length)
            this._removeItems(index, 1);
    }
    clear(): void {
        this._removeItems(0, this._items.length);
    }
    invalidate(): void {
        delete this._invertedItems;
    }
    private _addItem(element: T): void {
        this._items.push(element);
        delete this._invertedItems;
    }
    private _removeItems(start: number, count: number): void {
        this._items.splice(start, count);
        delete this._invertedItems;
    }
    get items(): Array<T> {
        return this._items.slice();
    }
    set items(value: Array<T>) {
        if(value)
            this._items = value.slice();
    }
    get length(): number {
        return this._items.length;
    }
    getItem(index: number): T {
        if(index > -1 && index < this._items.length)
            return this._items[index];
        return null;
    }
    get invertedItems(): Record<string, any> {
        this._invertedItems ??= this._createInvertedItems();
        return this._invertedItems;
    }
    private _createInvertedItems(): Record<any, any> {
        const result = { };
        for(let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            result[item.internalId] = item;
        }
        return result;
    }
    getItemById(id: string): T {
        return this.invertedItems[id];
    }
    getItemByPublicId(id: string): T {
        return this._items.filter(val => val.id === id || val.id.toString() === id)[0];
    }
    assign(sourceCollection: CollectionBase<T>): void {
        if(!isDefined(sourceCollection))
            return;

        this.items = sourceCollection.items;
    }
    importFromObject(source: any): void {
        if(!isDefined(source))
            return;

        this.clear();
        if(source._isGanttCollection)
            this.assign(source);
        else if(source instanceof Array)
            this.importFromArray(source);
        else
            this.createItemFromObjectAndAdd(source);
    }
    createItemFromObjectAndAdd(source: any): void {
        if(isDefined(source) && Object.keys(source).length > 0) {
            const item: T = this.createItem();
            item.assignFromObject(source);
            this.add(item);
        }
    }
    importFromArray(values: Array<any>): void {
        for(let i = 0; i < values.length; i++)
            this.createItemFromObjectAndAdd(values[i]);
    }
    importFromJSON(json: string): void {
        this.importFromObject(GanttJsonUtils.parseJson(json));
    }
    abstract createItem(): T;
}
