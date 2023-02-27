import { isDefined } from "@devexpress/utils/lib/utils/common";
import { IPdfTableValueProvider } from "./IPdfTableDataProvider";
import { StyleDef } from "./StyleDef";

export class CellDef implements IPdfTableValueProvider {
    private _styles: StyleDef;

    public constructor(content?: string|Record<string, any>, colSpan?: number, styles?: StyleDef|Record<string, any>) {
        if(typeof content === "string") {
            this.content = content;
            this.colSpan = colSpan;
            if(styles)
                this.appendStyles(styles);
        }
        else if(content)
            this.assign(content);
    }
    public content: string = "";
    public colSpan: number;
    public get styles(): StyleDef {
        if(!this._styles)
            this._styles = new StyleDef();
        return this._styles;
    }
    public assign(source: CellDef|Record<string, undefined>): void {
        if(isDefined(source["content"]))
            this.content = source["content"];
        if(isDefined(source["colSpan"]))
            this.colSpan = source["colSpan"];
        if(source["styles"])
            this.appendStyles(source["styles"]);
    }
    protected appendStyles(source: StyleDef|Record<string, any>): void {
        if(source)
            this.styles.assign(source);
    }

    public hasValue(): boolean { return true; }
    public getValue(): Record<string, any> {
        const result = { };
        result["content"] = this.content;
        if(this.colSpan > 1)
            result["colSpan"] = this.colSpan;
        if(this._styles)
            result["styles"] = this._styles.getValue();
        return result;
    }
}
