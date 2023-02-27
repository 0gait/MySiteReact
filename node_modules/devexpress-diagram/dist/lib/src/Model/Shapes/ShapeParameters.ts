export class ShapeParameter {
    constructor(public key: string, public value: number) {
    }
}
export class ShapeParameters {
    private items: { [key: string]: ShapeParameter } = {};

    add(parameter: ShapeParameter) {
        this.items[parameter.key] = parameter;
    }
    addRange(parameters: ShapeParameter[]) {
        for(let i = 0; i < parameters.length; i++)
            this.add(parameters[i]);
    }
    get(key: string): ShapeParameter {
        return this.items[key];
    }
    forEach(callback: (parameter: ShapeParameter) => void) {
        for(const key in this.items)
            if(Object.prototype.hasOwnProperty.call(this.items, key))
                callback(this.items[key]);
    }
    clone() {
        const result = new ShapeParameters();
        this.forEach(p => { result.add(new ShapeParameter(p.key, p.value)); });
        return result;
    }
    toObject() {
        const result = {};
        let modified = false;
        this.forEach(p => {
            result[p.key] = { "value": p.value };
            modified = true;
        });
        return modified ? result : null;
    }
    fromObject(obj: any) {
        this.forEach(p => {
            const paramObj = obj[p.key];
            if(paramObj)
                if(typeof paramObj["value"] === "number")
                    p.value = paramObj["value"];

        });
    }
}
