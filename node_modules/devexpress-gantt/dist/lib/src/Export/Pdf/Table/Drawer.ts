import { isDefined } from "@devexpress/utils/lib/utils/common";
import { IGanttTableExportInfo, PdfPageTableNames } from "../Interfaces";
import { EllipsisHelper } from "./Ellipsis";
import { TableOptions } from "./TableOptions";

export class PdfGanttTableDrawer {

    private _pdfDoc;
    static cellEllipsisSpace: number = 3;

    constructor(pdfDoc: any) {
        this._pdfDoc = pdfDoc;
    }
    public drawTable(info: IGanttTableExportInfo): void {
        if(info) {
            const options = this.createTableOptions(info);
            if(info.style?.fontSize)
                this._pdfDoc.setFontSize(info.style?.fontSize);
            this._pdfDoc.autoTable(options.getValue());
        }
    }
    public createTableOptions(info: IGanttTableExportInfo): TableOptions {
        const options = this.createDefaultTableOptions();
        this.addTableCommonSettings(info, options);
        this.addCommonTableStyles(info, options);
        this.prepareBodyCells(info);
        options.addBody(info.cells);
        if(info.hideRowLines)
            this.hideRowLines(options);
        return options;
    }
    protected createDefaultTableOptions(): TableOptions {
        const options = new TableOptions();

        options.pageBreak = "auto";
        options.margin.assign(0);
        options.tableWidth.assign("auto");

        options.styles.cellPadding.assign(0);
        options.styles.halign = "center";
        options.styles.valign = "middle";
        options.styles.lineWidth = 1;
        options.styles.overflow = "hidden";
        return options;
    }
    protected addTableCommonSettings(info: IGanttTableExportInfo, options: TableOptions): void {
        options.startY = info.position.y;
        options.margin.assign({ left: info.position.x });
        options.tableWidth.assign(info.size.width);
    }
    protected addCommonTableStyles(info: IGanttTableExportInfo, tableInfo: TableOptions): void {
        const styles = tableInfo.styles;
        styles.assign(info.style);
        if(styles.fillColor.opacity === 0)
            styles.fillColor.assign("#FFFFFF");
        styles.minCellHeight = info.baseCellSize.height;
        tableInfo.alternateRowStyles.minCellHeight = tableInfo.styles.minCellHeight;
        tableInfo.alternateRowStyles.fillColor.assign(tableInfo.styles.fillColor);

        if(isDefined(info.baseCellSize.width))
            styles.cellWidth.assign(info.baseCellSize.width);
    }
    protected prepareBodyCells(info: IGanttTableExportInfo): void {
        const needCheckText = info.name === PdfPageTableNames.treeListMain || info.name === PdfPageTableNames.chartScaleTop || info.name === PdfPageTableNames.chartScaleBottom;
        if(needCheckText) {
            const source = info.cells;
            for(let i = 0; i < source.length; i++) {
                const sourceRow = source[i];
                for(let j = 0; j < sourceRow.length; j++) {
                    const cell = sourceRow[j];
                    const styles = cell.styles;
                    const width = styles?.cellWidth?.getValue() as number || info.baseCellSize.width || 0;
                    const leftPadding = styles?.cellPadding.left ?? 0;
                    const rightPadding = styles?.cellPadding.right ?? 0;
                    const textWidth = Math.max(width - leftPadding - rightPadding - PdfGanttTableDrawer.cellEllipsisSpace, 0);
                    cell.content = EllipsisHelper.limitPdfTextWithEllipsis(cell.content, this._pdfDoc, textWidth);
                }
            }
        }
    }
    protected hideRowLines(options: TableOptions): void {
        options.styles.lineWidth = 0;
        options.onDrawCellCallback = (data) => {
            const cell = data.cell;
            const doc = data.doc;
            const color = cell.styles.lineColor;
            const left = cell.x;
            const right = cell.x + cell.styles.cellWidth;
            const top = cell.y;
            const bottom = cell.y + data.row.height;
            const isLastColumn = data.column.index === data.table.columns.length - 1;
            const isLastRow = data.row.index === data.table.body.length - 1;
            const isFirstRow = data.row.index === 0;

            doc.setDrawColor(color[0], color[1], color[2]);
            doc.setLineWidth(1);
            doc.line(left, bottom, left, top);
            if(isLastColumn)
                doc.line(right, bottom, right, top);
            if(isFirstRow)
                doc.line(left, top, right, top);
            if(isLastRow)
                doc.line(left, bottom, right, bottom);
        };
    }
}
