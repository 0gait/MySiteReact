import { isDefined } from "@devexpress/utils/lib/utils/common";
import { CellDef } from "./CellDef";
import { Color } from "./Color";
import { PredefinedStyles } from "./PredefinedStyles";
import { Margin } from "./Margin";
import { StyleDef } from "./StyleDef";
import { Width } from "./Width";
import { IPdfTableValueProvider } from "./IPdfTableDataProvider";

export class TableOptions implements IPdfTableValueProvider {

    private _margin: Margin = new Margin();
    private _pageBreak: string; 
    private _rowPageBreak: string; 
    private _showFoot: string;
    private _showHead: string;
    private _startY: number; 
    private _tableLineWidth: number;
    private _tableLineColor: Color = new Color(); 
    private _tableWidth: Width = new Width();

    private _body: Array<Array<CellDef>>;
    private _styles: StyleDef = new StyleDef();
    public _alternateRowStyles: StyleDef= new StyleDef();
    public _columnStyles: Array<StyleDef>;

    constructor() { }

    public get pageBreak(): string { return this._pageBreak; }
    public set pageBreak(value: string) { this._pageBreak = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.pageBreak); }
    public get rowPageBreak(): string { return this._rowPageBreak; }
    public set rowPageBreak(value: string) { this._rowPageBreak = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.rowPageBreak); }
    public get showHead(): string { return this._showHead; }
    public set showHead(value: string) { this._showHead = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.headerFooterVisibility); }
    public get showFoot(): string { return this._showFoot; }
    public set showFoot(value: string) { this._showFoot = PredefinedStyles.getPredefinedStringOrUndefined(value, PredefinedStyles.headerFooterVisibility); }
    public get startY(): number { return this._startY; }
    public set startY(value: number) { this._startY = value; }
    public get tableLineWidth(): number { return this._tableLineWidth; }
    public set tableLineWidth(value: number) { this._tableLineWidth = value; }


    public get margin(): Margin { return this._margin; }
    public get tableLineColor(): Color { return this._tableLineColor; }
    public get tableWidth(): Width { return this._tableWidth; }

    public get body(): Array<Array<CellDef>> { return this._body; }
    public get styles(): StyleDef { return this._styles; }
    public get alternateRowStyles(): StyleDef { return this._alternateRowStyles; }

    public onDrawCellCallback: (data: Record<string, any>) => void;

    public hasValue(): boolean { return true; }

    public getValue(): Record<string, any> {
        const options = { };
        options["pageBreak"] = this.pageBreak;
        options["rowPageBreak"] = this.rowPageBreak;
        options["showFoot"] = this.showFoot;
        options["showHead"] = this.showHead;
        options["startY"] = this.startY;
        options["tableLineWidth"] = this.tableLineWidth;

        this.getJsPdfProviderProps().forEach(key => {
            const prop = this[key] as IPdfTableValueProvider;
            if(prop && prop.hasValue())
                options[key] = prop.getValue();
        });

        options["body"] = this.getBodyForJsPdf();
        options["columnStyles"] = this.getColumnStylesForJsPdf();
        if(this.onDrawCellCallback)
            options["didDrawCell"] = this.onDrawCellCallback;
        return options;
    }
    protected getJsPdfProviderProps(): Array<string> {
        return [
            "margin",
            "tableLineColor",
            "tableWidth",
            "styles",
            "alternateRowStyles"
        ];
    }
    public getBodyForJsPdf(): Array<Array<any>> {
        const result = [];
        for(let i = 0; i < this._body.length; i++) {
            const sourceRow = this._body[i];
            const row = [];
            for(let j = 0; j < sourceRow.length; j++)
                row.push(sourceRow[j].getValue());
            result.push(row);
        }
        return result;
    }
    public assign(source: TableOptions|Record<string, undefined>): void {
        if(!source)
            return;
        if(isDefined(source["margin"]))
            this.margin.assign(source["margin"]);
        if(isDefined(source["pageBreak"]))
            this.pageBreak = source["pageBreak"];
        if(isDefined(source["rowPageBreak"]))
            this.rowPageBreak = source["rowPageBreak"];
        if(isDefined(source["showFoot"]))
            this.showFoot = source["showFoot"];
        if(isDefined(source["showHead"]))
            this.showHead = source["showHead"];
        if(isDefined(source["startY"]))
            this.startY = source["startY"];
        if(isDefined(source["tableLineWidth"]))
            this.tableLineWidth = source["tableLineWidth"];
        if(isDefined(source["tableLineColor"]))
            this.tableLineColor.assign(source["tableLineColor"]);
        if(isDefined(source["tableWidth"]))
            this.tableWidth.assign(source["tableWidth"]);
    }
    public addBody(source: Array<Array<CellDef|Record<string, undefined>>>): void {
        if(!source)
            return;
        this._body = new Array<Array<CellDef>>();
        this.addCells(source, this._body);
    }
    protected addCells(source: Array<Array<CellDef|Record<string, undefined>>>, target: Array<Array<CellDef>>): void {
        const tableBackColor = this.styles.fillColor;
        for(let i = 0; i < source.length; i++) {
            const sourceRow = source[i];
            const row = new Array<CellDef>();
            for(let j = 0; j < sourceRow.length; j++) {
                const cell = new CellDef(sourceRow[j]);
                if(tableBackColor.hasValue() && cell.styles && cell.styles.fillColor.hasValue())
                    cell.styles.fillColor.applyOpacityToBackground(tableBackColor);
                row.push(cell);
            }
            target.push(row);
        }
    }
    public applyColumnStyle(key: number, style: Record<string, any>):void {
        this._columnStyles ??= new Array<StyleDef>();
        this._columnStyles[key] = new StyleDef(style);
    }
    protected getColumnStylesForJsPdf(): Record<string, any> {
        if(this._columnStyles) {
            const result = { };
            this._columnStyles.forEach((v, i) => {
                if(v)
                    result[i] = v.getValue();
            });
            return result;
        }
        return null;
    }
}
