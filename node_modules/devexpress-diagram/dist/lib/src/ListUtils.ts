export class HashSet<T> {
    protected items: T[] = [];
    protected map: {[key: string]: number} = {};
    private getHashCode: (item: T) => string;
    constructor(list: T[] = [], getHashCode: (item: T) => string = (item) => item.toString()) {
        this.getHashCode = getHashCode;
        list.forEach(i => this.tryPush(i));
    }
    tryPush(item: T): boolean {
        const code = this.getHashCode(item);
        if(this.map[code] === undefined) {
            this.map[code] = this.items.push(item) - 1;
            return true;
        }
        return false;
    }
    contains(item: T): boolean {
        return this.map[this.getHashCode(item)] !== undefined;
    }
    forEach(callback: (item: T, index: number) => void) {
        this.items.forEach(callback);
    }
    filter(predicate: (item: T, index: number) => boolean) {
        return this.items.filter(predicate);
    }
    list(): T[] {
        return this.items.slice(0);
    }
    item(index: number): T {
        return this.items[index];
    }
    first(): T {
        return this.items[0];
    }
    remove(item: T) {
        const code = this.getHashCode(item);
        const index = this.map[code];
        if(typeof index === "number") {
            delete this.map[code];
            this.items.splice(index, 1);
            for(let i = index; i < this.items.length; i++)
                this.map[this.getHashCode(this.items[i])]--;
        }
        else
            throw "Item not found";

    }
    get length(): number { return this.items.length; }
}
export interface IHashCodeOwner {
    getHashCode(): string;
}

export type KeySet = {[key: string]: boolean};
export type KeyNumberMap = {[key: string]: number};
