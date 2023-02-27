import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { Color } from "./Color";
import { PredefinedStyles } from "./PredefinedStyles";
import { IPdfTableValueProvider } from "./IPdfTableDataProvider";
import { Margin } from "./Margin";
import { Width } from "./Width";

export class StyleDef implements IPdfTableValueProvider {

    private _fontFamily: string;
    private _fontStyle: string;
    private _overflow: string;
    private _horizontalAlign: string;
    private _verticalAlign: string;
    private _fillColor: Color = new Color();
    private _textColor: Color = new Color();
    private _lineColor: Color = new Color();
    private _cellWidth: Width = new Width();
    private _cellPadding: Margin = new Margin();
    private _fontSize: number;
    private _lineWidth: number; 
    private _minCellWidth: number;
    private _minCellHeight: number;

    public constructor(source?: Record<string, any>) {
        if(source)
            this.assign(source);
    }

    public get font(): string { return this._fontFamily; }
    public set font(value: string) { this._fontFamily = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.fontFamilies) || value; }
    public get fontStyle(): string { return this._fontStyle; }
    public set fontStyle(value: string) { this._fontStyle = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.fontStyles); }

    public get fontSize(): number { return this._fontSize; }
    public set fontSize(value: number) { this._fontSize = value; }

    public get overflow(): string { return this._overflow; }
    public set overflow(value: string) { this._overflow = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.overflow); }

    public get halign(): string { return this._horizontalAlign; }
    public set halign(value: string) { this._horizontalAlign = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.horizontalAlign); }

    public get valign(): string { return this._verticalAlign; }
    public set valign(value: string) { this._verticalAlign = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.verticalAlign); }

    public get fillColor(): Color { return this._fillColor; }
    public get textColor(): Color { return this._textColor; }
    public get lineColor(): Color { return this._lineColor; }
    public get cellWidth(): Width { return this._cellWidth; }
    public get cellPadding(): Margin { return this._cellPadding; }
    public get lineWidth(): number { return this._lineWidth; }
    public set lineWidth(value: number) { this._lineWidth = value; }
    public get minCellWidth(): number { return this._minCellWidth; }
    public set minCellWidth(value: number) { this._minCellWidth = value; }
    public get minCellHeight(): number { return this._minCellHeight; }
    public set minCellHeight(value: number) { this._minCellHeight = value; }

    public assign(source: StyleDef|Record<string, any>): void {
        if(!source)
            return;

        if(source instanceof StyleDef) {
            if(isDefined(source["font"]))
                this.font = source["font"];
            if(isDefined(source["fontStyle"]))
                this.fontStyle = source["fontStyle"];
            if(isDefined(source["overflow"]))
                this.overflow = source["overflow"];
            if(isDefined(source["halign"]))
                this.halign = source["halign"];
            if(isDefined(source["valign"]))
                this.valign = source["valign"];
            if(isDefined(source["fontSize"]))
                this.fontSize = source["fontSize"];
            if(isDefined(source["lineWidth"]))
                this.lineWidth = source["lineWidth"];
            if(isDefined(source["minCellWidth"]))
                this.minCellWidth = source["minCellWidth"];
            if(isDefined(source["minCellHeight"]))
                this.minCellHeight = source["minCellHeight"];
            if(isDefined(source["fillColor"]))
                this.fillColor.assign(source["fillColor"]);
            if(isDefined(source["textColor"]))
                this.textColor.assign(source["textColor"]);
            if(isDefined(source["lineColor"]))
                this.lineColor.assign(source["lineColor"]);
            if(isDefined(source["cellWidth"]))
                this.cellWidth.assign(source["cellWidth"]);
            if(isDefined(source["cellPadding"]))
                this.cellPadding.assign(source["cellPadding"]);
        }
        else
            this.assignFromCssStyle(source);
    }
    public assignFromCssStyle(source: Record<string, any>): void {

        if(source.fontFamily)
            this.font = this.getPdfFontFamily(source);
        this.fontStyle = this.getPdfFontStyle(source);

        if(isDefined(source.fontSize))
            this.fontSize = this.getPfrFontSize(source.fontSize);
        if(source.textAlign)
            this.halign = source.textAlign;
        if(source.verticalAlign)
            this.valign = source.verticalAlign;
        if(isDefined(source.borderWidth))
            this.lineWidth = source.borderWidth;
        if(isDefined(source.cellWidth))
            this.cellWidth.assign(source.cellWidth);
        if(isDefined(source.width))
            this.minCellWidth = typeof source.width === "number" ? source.width : DomUtils.pxToInt(source.width);
        if(isDefined(source.height))
            this.minCellHeight = typeof source.height === "number" ? source.height : DomUtils.pxToInt(source.height);
        if(source.backgroundColor)
            this.fillColor.assign(source.backgroundColor);
        if(source.color)
            this.textColor.assign(source.color);
        if(source.borderColor)
            this.lineColor.assign(source.borderColor);
        if(isDefined(source.width))
            this.cellWidth.assign(source.width);
        this.assignPaddingFromCss(source);
        if(isDefined(source.extraLeftPadding)) {
            const currentLeftPadding = this._cellPadding.left;
            this._cellPadding.left = currentLeftPadding ? currentLeftPadding + source.extraLeftPadding : source.extraLeftPadding;
        }
    }
    protected getPdfFontStyle(style: Record<string, any>): string {
        const fontWeight = style.fontWeight;
        const numeric = parseInt(fontWeight);
        const isBold = fontWeight === "bold" || !isNaN(numeric) && numeric > 500;
        const isItalic = style.fontStyle === "italic";
        let result = isBold ? "bold" : "normal";
        if(isItalic)
            result = isBold ? "bolditalic" : "italic";
        return result;
    }
    protected getPdfFontFamily(style: Record<string, any>): string {
        const fontFamily = style.fontFamily && style.fontFamily.toLowerCase();
        let result = "helvetica";
        if(fontFamily.indexOf("times") > -1)
            result = "times";
        if(fontFamily.indexOf("courier") > -1)
            result = "courier";
        return result;
    }
    protected getPfrFontSize(fontSize: string): number {
        const size = DomUtils.pxToInt(fontSize);
        if(!isNaN(size))
            return Math.ceil(size / 96 * 72);
    }
    protected assignPaddingFromCss(source: Record<string, any>): void {
        if(source.padding)
            this._cellPadding.assign(source.padding);
        else {
            const padding = { };
            if(source.paddingLeft)
                padding["left"] = DomUtils.pxToInt(source.paddingLeft);
            if(source.paddingTop)
                padding["top"] = DomUtils.pxToInt(source.paddingTop);
            if(source.paddingRight)
                padding["right"] = DomUtils.pxToInt(source.paddingRight);
            if(source.paddingBottom)
                padding["bottom"] = DomUtils.pxToInt(source.paddingBottom);
            this._cellPadding.assign(padding);
        }
    }

    public hasValue(): boolean {
        return true;
    }
    public getValue(): Record<string, any> {
        const style = { };
        if(isDefined(this.font))
            style["font"] = this.font;
        if(isDefined(this.fontStyle))
            style["fontStyle"] = this.fontStyle;
        if(isDefined(this.fontSize))
            style["fontSize"] = this.fontSize;
        if(isDefined(this.overflow))
            style["overflow"] = this.overflow;
        if(isDefined(this.halign))
            style["halign"] = this.halign;
        if(isDefined(this.valign))
            style["valign"] = this.valign;
        if(isDefined(this.lineWidth))
            style["lineWidth"] = this.lineWidth;
        if(isDefined(this.minCellWidth))
            style["minCellWidth"] = this.minCellWidth;
        if(isDefined(this.minCellHeight))
            style["minCellHeight"] = this.minCellHeight;

        this.getJsPdfProviderProps().forEach(key => {
            const prop = this[key] as IPdfTableValueProvider;
            if(prop && prop.hasValue())
                style[key] = prop.getValue();
        });
        return style;
    }
    protected getJsPdfProviderProps(): Array<string> {
        return [
            "fillColor",
            "textColor",
            "lineColor",
            "cellWidth",
            "cellPadding"
        ];
    }
}
