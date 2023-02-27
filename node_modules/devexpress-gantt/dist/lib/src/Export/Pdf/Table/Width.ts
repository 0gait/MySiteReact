import { PredefinedStyles } from "./PredefinedStyles";
import { IPdfTableValueProvider } from "./IPdfTableDataProvider";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";

export class Width implements IPdfTableValueProvider {
    protected _widthInternal: number|string;

    constructor(width?: number|string) {
        this.assign(width);
    }
    public assign(source: number|string|Width): void {
        if(source instanceof Width)
            this._widthInternal = source._widthInternal;
        else {
            const num = typeof source === "number" ? source : parseInt(source);
            if(!isNaN(num))
                this._widthInternal = num;
            else
                this.assignFromString(source as string);
        }
    }

    protected assignFromString(source: string): void {
        if(source) {
            const px = DomUtils.pxToInt(source);
            if(px)
                this._widthInternal = px;
            else
                this._widthInternal = PredefinedStyles.getPredefinedStringOrUndefined(source, PredefinedStyles.width);
        }
    }

    public hasValue(): boolean {
        return !!this._widthInternal;
    }
    public getValue(): string|number {
        return this._widthInternal;
    }
}
