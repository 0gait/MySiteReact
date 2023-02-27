import { isDefined } from "@devexpress/utils/lib/utils/common";
import { StyleDef } from "../Table/StyleDef";

export class PdfTaskResourcesInfo {

    public x: number;
    public y: number;
    public text: string;
    public style: StyleDef;

    constructor(text?: string, style?: StyleDef, x?: number, y?: number) {
        if(text)
            this.text = text;
        if(style)
            this.style = new StyleDef(style);
        if(isDefined(x))
            this.x = x;
        if(isDefined(y))
            this.y = y;
    }
    public assign(source: PdfTaskResourcesInfo): void {
        this.text = source.text;
        this.style = new StyleDef(source.style);
        this.x = source.x;
        this.y = source.y;
    }
}
