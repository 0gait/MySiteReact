import { Size } from "@devexpress/utils/lib/geometry/size";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { Margin } from "../Table/Margin";
import { PdfDataRange } from "./DataRange";
import { PdfCustomFontSettings } from "./CustomFont";
import { DataExportMode, ExportMode } from "./Enums";


export interface IPdfExportRangeProps {
    exportMode: ExportMode;
    exportDataMode: DataExportMode;
    dateRange: PdfDataRange;
}

export class GanttPdfExportProps implements IPdfExportRangeProps {
    public static autoFormatKey = "auto";

    constructor(props?: GanttPdfExportProps | Record<string, any>) {
        if(props)
            this.assign(props);
    }
    public pdfDoc: Record<string, any>;
    public docCreateMethod: (prop?: Record<string, any>) => any;
    public fileName: string;
    public format: string;
    public pageSize: Size;
    public landscape: boolean = false;
    public margins: Margin = null;

    public exportMode: ExportMode = ExportMode.all;
    public exportDataMode: DataExportMode = DataExportMode.visible;
    public dateRange: PdfDataRange;

    public font: PdfCustomFontSettings;

    public assign(source: GanttPdfExportProps | Record<string, any>):void {
        if(!source)
            return;
        if(isDefined(source["pdfDocument"]))
            this.pdfDoc = source["pdfDocument"];
        if(isDefined(source.pdfDoc))
            this.pdfDoc = source.pdfDoc;
        this.docCreateMethod = source.docCreateMethod;

        if(isDefined(source.fileName))
            this.fileName = source.fileName;

        this.landscape = !!source.landscape;

        if(isDefined(source.margins))
            this.margins = new Margin(source.margins);


        if(isDefined(source.format)) {
            const formatSrc = source.format;
            if(typeof formatSrc === "string")
                this.format = formatSrc;
            else {
                const width = parseInt(formatSrc.width);
                const height = parseInt(formatSrc.height);
                this.pageSize = new Size(width, height);
            }
        }
        else if(isDefined(source.pageSize)) {
            const size = source.pageSize;
            this.pageSize = size instanceof Size ? size.clone() : new Size(size.width, size.height);
        }
        if(isDefined(source.exportMode))
            this.exportMode = this.getEnumValue(ExportMode, source.exportMode);

        if(isDefined(source.dateRange)) {
            const rangeSrc = source.dateRange;
            const isEnum = typeof rangeSrc === "number" || typeof rangeSrc === "string";
            if(isEnum)
                this.exportDataMode = this.getEnumValue(DataExportMode, rangeSrc);
            else
                this.dateRange = new PdfDataRange(rangeSrc);
        }
        if(isDefined(source.font))
            this.font = new PdfCustomFontSettings(source.font);
    }

    protected getEnumValue(type: any, value: any): any {
        if(!isDefined(type[value as string|number]))
            return null;
        const num = parseInt(value);
        if(!isNaN(num))
            return num;
        return type[value];
    }
}
