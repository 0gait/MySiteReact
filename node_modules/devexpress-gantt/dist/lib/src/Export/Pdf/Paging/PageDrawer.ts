import { Point } from "@devexpress/utils/lib/geometry/point";
import { PdfObjectDrawer } from "../DataObjects/Drawer";
import { IGanttPageExportInfo, IGanttTableExportInfo, PdfPageTableNames } from "../Interfaces";
import { ExportMode } from "../Settings/Enums";
import { GanttPdfExportProps } from "../Settings/Props";
import { PdfGanttTableDrawer } from "../Table/Drawer";

export class PdfGanttPageDrawer {
    private _pdfDoc;
    private _props: GanttPdfExportProps;

    constructor(pdfDoc: any, props: GanttPdfExportProps) {
        this._pdfDoc = pdfDoc;
        this._props = props;
    }
    public drawPage(info: IGanttPageExportInfo): void {
        const pdfDoc = this._pdfDoc;
        const tableDrawer = new PdfGanttTableDrawer(pdfDoc);

        if(this.needDrawChart()) {
            tableDrawer.drawTable(info.tables[PdfPageTableNames.chartMain]);
            const objectDrawer = new PdfObjectDrawer(pdfDoc, info.objects);
            objectDrawer.draw();
            tableDrawer.drawTable(info.tables[PdfPageTableNames.chartScaleTop]);
            tableDrawer.drawTable(info.tables[PdfPageTableNames.chartScaleBottom]);
        }
        if(this.needDrawTreeList()) {
            tableDrawer.drawTable(info.tables[PdfPageTableNames.treeListMain]);
            tableDrawer.drawTable(info.tables[PdfPageTableNames.treeListHeader]);
        }
        this.drawMargins(info);
        return pdfDoc;
    }
    protected needDrawChart(): boolean {
        return !this._props || this._props.exportMode === ExportMode.all || this._props.exportMode === ExportMode.chart;
    }
    protected needDrawTreeList(): boolean {
        return !this._props || this._props.exportMode === ExportMode.all || this._props.exportMode === ExportMode.treeList;
    }
    protected getContentRightBottom(info: IGanttPageExportInfo): Point {
        const p = new Point(0, 0);
        for(const key in info.tables)
            if(Object.prototype.hasOwnProperty.call(info.tables, key)) {
                const table = info.tables[key] as IGanttTableExportInfo;
                p.x = Math.max(p.x, table.position.x + table.size.width);
                p.y = Math.max(p.y, table.position.y + table.size.height);
            }
        return p;
    }
    public drawMargins(info: IGanttPageExportInfo): void {
        const pdfDoc = this._pdfDoc;
        const props = this._props;
        const docWidth = pdfDoc.getPageWidth();
        const docHeight = pdfDoc.getPageHeight();
        const p = this.getContentRightBottom(info);

        pdfDoc.setFillColor(255, 255, 255);
        pdfDoc.rect(0, 0, props.margins.left, docHeight, "F");
        pdfDoc.rect(0, 0, docWidth, props.margins.top, "F"); 
        pdfDoc.rect(p.x, 0, docWidth, docHeight, "F");
        pdfDoc.rect(0, p.y, docWidth, docHeight, "F");
    }
}
