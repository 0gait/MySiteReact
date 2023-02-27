import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { IPdfTableValueProvider } from "./IPdfTableDataProvider";

export class Margin implements IPdfTableValueProvider {
    constructor(values?: number|string|Array<number>|Record<string, number>) {
        this.assign(values);
    }

    public bottom: number;
    public left: number;
    public right: number;
    public top: number;

    public assign(values: number|string|Array<number>|Record<string, number>|Margin): void {
        if(!isDefined(values))
            return;

        if(typeof values === "string")
            this.assignFromString(values);
        else if(typeof values === "number" || values instanceof Array)
            this.assignWithValues(values);
        else {
            const source = values as Margin || values as Record<string, number>;
            this.assignWithMargin(source);
        }
    }
    assignFromString(source: string): void {
        const values = source.split(" ").map(p => DomUtils.pxToInt(p));
        this.assignWithValues(values);
    }
    assignWithMargin(source: Margin|Record<string, number>): void {
        if(isDefined(source.top))
            this.top = source.top;
        if(isDefined(source.right))
            this.right = source.right;
        if(isDefined(source.bottom))
            this.bottom = source.bottom;
        if(isDefined(source.left))
            this.left = source.left;
    }
    assignWithValues(values: number|Array<number>): void {
        const numbers = this.getCorrectedValues(values);
        this.top = numbers[0];
        this.right = numbers[1];
        this.bottom = numbers[2];
        this.left = numbers[3];
    }
    getCorrectedValues(values: number|Array<number>): Array<number> {
        let result: Array<number> = [this.top, this.right, this.bottom, this.left];
        if(typeof values === "number") {
            const num = values as number;
            result = [num, num, num, num];
        }
        else {
            const numbers = values as Array<number>;
            switch(numbers.length) {
                case 1:
                    result = [numbers[0], numbers[0], numbers[0], numbers[0]];
                    break;
                case 2:
                    result = [numbers[0], numbers[1], numbers[0], numbers[1]];
                    break;
                case 3:
                    result = [numbers[0], numbers[1], numbers[2], numbers[1]];
                    break;
                default:
                    numbers.forEach((v, i) => result[i] = v);
                    break;
            }
        }
        return result;
    }
    public hasValue(): boolean {
        return isDefined(this.top) || isDefined(this.left) || isDefined(this.right) || isDefined(this.bottom);
    }
    public getValue(): Record<string, number>|number {
        if(!this.hasValue())
            return null;
        if(this.top === this.bottom && this.left === this.right && this.top === this.left)
            return this.top;

        const result = { };
        if(isDefined(this.top))
            result["top"] = this.top;
        if(isDefined(this.left))
            result["left"] = this.left;
        if(isDefined(this.right))
            result["right"] = this.right;
        if(isDefined(this.bottom))
            result["bottom"] = this.bottom;
        return result;
    }
}
