export class ConnectorText {
    constructor(public position: number, public value: string) { }
}
export class ConnectorTexts {
    private items: { [key: number]: ConnectorText } = {};

    get(position: number): ConnectorText {
        return this.items[position];
    }
    set(position: number, text: ConnectorText) {
        this.items[position] = text;
    }
    remove(position: number) {
        delete this.items[position];
    }
    map<T>(callback: (text: ConnectorText) => T): T[] {
        const list: T[] = [];
        this.forEach(t => list.push(callback(t)));
        return list;
    }
    forEach(callback: (text: ConnectorText) => void) {
        for(const key in this.items)
            if(Object.prototype.hasOwnProperty.call(this.items, key))
                callback(this.items[key]);
    }
    count() {
        return Object.keys(this.items).length;
    }
    clone() {
        const result = new ConnectorTexts();
        this.forEach(t => { result.set(t.position, new ConnectorText(t.position, t.value)); });
        return result;
    }
    toObject() {
        const result = {};
        let modified = false;
        this.forEach(t => {
            result[t.position] = t.value;
            modified = true;
        });
        return modified ? result : null;
    }
    fromObject(obj: any) {
        for(const key in obj)
            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                const position = parseFloat(key);
                if(!isNaN(position) && typeof obj[key] === "string")
                    this.set(position, new ConnectorText(position, obj[key]));

            }

    }
}
