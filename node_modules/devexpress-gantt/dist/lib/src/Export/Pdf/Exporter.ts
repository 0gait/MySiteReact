import { IGanttExportInfo } from "./Interfaces";
import { PdfGanttPageDrawer } from "./Paging/PageDrawer";
import { GanttPdfExportProps } from "./Settings/Props";

export class PdfGanttExporter {

    private _info: IGanttExportInfo;
    private _pdfDoc: Record<string, any>;

    constructor(info: IGanttExportInfo) {
        if(!info.settings.pdfDoc && !info.settings.docCreateMethod)
            throw new Error("Cannot convert gantt to pdf without document instance!");

        this._info = info;
    }

    public export(): any {
        const pdfDoc = this.pdfDoc;
        this.applyCustomFont();
        const info = this._info;
        const drawer = new PdfGanttPageDrawer(pdfDoc, info.settings);
        const pages = info.getPages(pdfDoc);
        const count = pages.length;
        for(let i = 0; i < count; i++) {
            if(i > 0)
                pdfDoc.addPage(this.getDocumentFormat(), this.getOrientation());
            const page = pages[i];
            drawer.drawPage(page);
        }
        if(this.props?.fileName)
            pdfDoc.save(this.props?.fileName);
        return pdfDoc;
    }
    protected get pdfDoc(): any {
        this._pdfDoc ??= this._info.settings.pdfDoc ?? this.createDoc();
        return this._pdfDoc;
    }
    private get props(): GanttPdfExportProps {
        return this._info.settings;
    }
    protected createDoc(): any {
        const jsPDFProps = this.getJsPDFProps();
        return this._info.settings.docCreateMethod(jsPDFProps);
    }
    protected getJsPDFProps(): Record<string, any> {
        const props = { putOnlyUsedFonts: true, unit: "px", hotfixes: ["px_scaling"] }; 
        props["orientation"] = this.getOrientation();
        props["format"] = this.getDocumentFormat();
        return props;
    }
    protected getOrientation(): string {
        return this.props?.landscape ? "l" : "p";
    }
    protected getDocumentFormat(): string|Array<number> {
        if(!this.props?.format && !this.props?.pageSize)
            return "a4";

        if(this.props?.pageSize)
            return [ this.props.pageSize.height, this.props.pageSize.width ];

        return this.props?.format;
    }
    protected applyCustomFont(): void {
        if(this.props.font)
            this.props.font.applyToDoc(this.pdfDoc);
    }
}
