import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { PdfDependencyLineInfo } from "../DataObjects/DependencyLineInfo";
import { PdfTaskInfo } from "../DataObjects/TaskInfo";
import { PdfTaskResourcesInfo } from "../DataObjects/TaskResourcesInfo";
import { PdfTimeMarkerInfo } from "../DataObjects/TimeMarkerInfo";
import { IGanttPageExportInfo, IGanttTableExportInfo, PdfPageTableNames } from "../Interfaces";
import { GanttPdfExportProps } from "../Settings/Props";
import { CellDef } from "../Table/CellDef";
import { PageNavigation } from "./PageNavigation";

class CellNavigationInfo {
    pageVerIndex: number;
    pageHorIndex: number;
    cellRowIndexOnPage: number;
    cellColIndexOnPage: number;
    cell: CellDef;
    constructor(pageHorIndex: number, pageVerIndex: number, cellRowIndexOnPage: number, cellColIndexOnPage: number, cell: CellDef) {
        this.pageVerIndex = pageVerIndex;
        this.pageHorIndex = pageHorIndex;
        this.cellRowIndexOnPage = cellRowIndexOnPage;
        this.cellColIndexOnPage = cellColIndexOnPage;
        this.cell = cell;
    }
}

class VectorInfo {
    pageIndex: number;
    globalCellIndex: number;
    pageOffset: number;
    cutSize: number;

    constructor(pageIndex: number, globalCellIndex: number, pageOffset: number, cutSize?: number) {
        this.pageIndex = pageIndex;
        this.globalCellIndex = globalCellIndex;
        this.pageOffset = pageOffset;
        this.cutSize = cutSize;
    }
    public get isCutted(): boolean {
        return this.cutSize > 0;
    }
    public get cellIndexOnPage(): number {
        return this.globalCellIndex - this.pageOffset;
    }
}

export class PdfGanttPaginator {
    private _pdfDoc;
    private _props: GanttPdfExportProps;
    private _globalInfo: IGanttPageExportInfo;
    private _pages: Array<Array<IGanttPageExportInfo>>;
    private _pageNavigator: PageNavigation;
    private _correctedPageBottoms: Array<number>;

    private _pageLeft: number;
    private _pageRight: number;
    private _pageTop: number;
    private _pageBottom: number;

    constructor(pdfDoc: any, props: GanttPdfExportProps, globalInfo: IGanttPageExportInfo) {
        this._pdfDoc = pdfDoc;
        this._props = props;
        this._globalInfo = globalInfo;
    }
    public getPages(): Array<IGanttPageExportInfo> {
        delete this._pages;
        this._paginateTables();
        this._paginateObjects();
        return this.pageMatrixToArray;
    }
    private _paginateTables(): void {
        this._paginateTable(PdfPageTableNames.treeListHeader);
        this._paginateTable(PdfPageTableNames.treeListMain);
        this._paginateTable(PdfPageTableNames.chartScaleBottom);
        this._paginateTable(PdfPageTableNames.chartScaleTop);
        this._paginateTable(PdfPageTableNames.chartMain);
    }
    private _paginateObjects(): void {
        this._paginateTasks();
        this._paginateDependencies();
        this._paginateResources();
        this._paginateTimeMarkers();
    }
    private get pageMatrixToArray(): Array<IGanttPageExportInfo> {
        let result = new Array<IGanttPageExportInfo>();
        this._pages?.forEach(row => {
            result = result.concat(row);
        });
        return result;
    }
    private _paginateTasks(): void {
        this._globalInfo.objects?.tasks?.forEach(t => this._paginateTask(t));
    }
    private _paginateDependencies(): void {
        this._globalInfo.objects?.dependencies?.forEach(d => {
            if(d.arrowInfo)
                this._paginateArrow(d);
            else
                this._paginateDependencyLine(d);
        });
    }
    private _paginateResources(): void {
        this._globalInfo.objects?.resources?.forEach(r => this._paginateResource(r));
    }
    private _paginateTimeMarkers(): void {
        this._globalInfo.objects?.timeMarkers?.forEach(m => this._paginateTimeMarker(m));
    }
    private _paginateTable(tableKey: string): void {
        const table = this._globalInfo?.tables[tableKey];
        if(table) {
            const start = this._getTableStart(table);
            const matrix = this._preparePagesNavigationMatrixForTable(start, table);
            const rowCount = matrix.length;
            for(let i = 0; i < rowCount; i++) {
                const colCount = matrix[i].length;
                for(let j = 0; j < colCount; j++) {
                    const navInfo = matrix[i][j];
                    const page = this._getPage(navInfo.pageVerIndex, navInfo.pageHorIndex, true);
                    const tablePositionX = navInfo.pageHorIndex === start.hIndex ? start.pageX : this.pageLeft;
                    const tablePositionY = navInfo.pageVerIndex === start.vIndex ? start.pageY : this.pageTop;
                    this._setTablePositionOnPage(page, tableKey, tablePositionX, tablePositionY);
                    this._addCellToPage(page, tableKey, navInfo);
                }
            }
            this._updateTableSizeOnPages(tableKey);
        }
    }
    private _paginateTask(task: PdfTaskInfo): void {
        const hOffsets = this._getTaskPagination(task);
        const vOffsets = this._getTaskPagination(task, true);
        for(let i = 0; i < vOffsets.length; i++)
            for(let j = 0; j < hOffsets.length; j++) {
                const newTask = new PdfTaskInfo();
                newTask.assign(task);
                this._offsetPoints(newTask.sidePoints, hOffsets[j].offset, vOffsets[i].offset);
                this._addTaskToPage(vOffsets[i].pageIndex, hOffsets[j].pageIndex, newTask);
            }
    }
    private _paginateArrow(dependency: PdfDependencyLineInfo): void {
        const pointInfo = this._getPointPageInfo(dependency.points[0]);
        const newDependency = new PdfDependencyLineInfo();
        newDependency.assign(dependency);
        this._offsetPoints(newDependency.points, pointInfo.offsetX, pointInfo.offsetY);
        this._addDependencyToPage(pointInfo.pageVerIndex, pointInfo.pageHorIndex, newDependency);
    }
    private _paginateDependencyLine(dependency: PdfDependencyLineInfo): void {
        const hPagination = this._getDependencyLinePagination(dependency);
        const vPagination = this._getDependencyLinePagination(dependency, true);
        for(let i = 0; i < vPagination.length; i++)
            for(let j = 0; j < hPagination.length; j++) {
                const newDependency = new PdfDependencyLineInfo();
                newDependency.assign(dependency);
                this._offsetPoints(newDependency.points, hPagination[j].offset, vPagination[i].offset);
                this._addDependencyToPage(vPagination[i].pageIndex, hPagination[j].pageIndex, newDependency);
            }
    }
    private _paginateResource(resource: PdfTaskResourcesInfo): void {
        const pointInfo = this._getPointPageInfo(new Point(resource.x, resource.y));
        const newResource = new PdfTaskResourcesInfo();
        newResource.assign(resource);
        newResource.x -= pointInfo.offsetX;
        newResource.y -= pointInfo.offsetY;
        this._addResourceToPage(pointInfo.pageVerIndex, pointInfo.pageHorIndex, newResource);
    }
    private _paginateTimeMarker(timeMarker: PdfTimeMarkerInfo): void {
        const hPagination = this._getTimeMarkerPagination(timeMarker);
        const vPagination = this._getTimeMarkerPagination(timeMarker, true);
        for(let i = 0; i < vPagination.length; i++)
            for(let j = 0; j < hPagination.length; j++) {
                const newMarker = new PdfTimeMarkerInfo();
                newMarker.assign(timeMarker);
                newMarker.start.x -= hPagination[j].offset;
                newMarker.start.y -= vPagination[i].offset;
                this._addTimeMarkerToPage(vPagination[i].pageIndex, hPagination[j].pageIndex, newMarker);
            }
    }
    private _getTableStart(table: IGanttTableExportInfo): PageNavigation {
        const start = new PageNavigation(this.pageBorders, 0, 0, 0, 0, this.correctedPageBottoms);
        start.offset(table.position.x, table.position.y);
        return start;
    }
    private _getPage(rowIndex: number, colIndex: number, forceCreate?: boolean): IGanttPageExportInfo {
        if(forceCreate)
            this._extendPageMatrixIfRequired(rowIndex, colIndex);
        return this._pages[rowIndex] && this._pages[rowIndex][colIndex];
    }
    private _getTableOrCreate(page: IGanttPageExportInfo, tableKey: string): IGanttTableExportInfo {
        page.tables[tableKey] ??= this._createTable(tableKey);
        return page.tables[tableKey];
    }
    private _preparePagesNavigationMatrixForTable(start: PageNavigation, table: IGanttTableExportInfo): Array<Array<CellNavigationInfo>> {
        const matrix = new Array<Array<CellNavigationInfo>>();
        const verticalVector = this._getTableNavigationVector(start, table, true);
        const rowCount = verticalVector.length;
        for(let i = 0; i < rowCount; i++) {
            const row = new Array<CellNavigationInfo>();
            const vInfo = verticalVector[i];
            const horizontalVector = this._getTableNavigationVector(start, table, false, vInfo.globalCellIndex);
            const colCount = horizontalVector.length;
            for(let j = 0; j < colCount; j++) {
                const hInfo = horizontalVector[j];
                const cancelTextCut = table.name === PdfPageTableNames.chartScaleTop;
                const cell = this._prepareCuttedCell(table.cells[vInfo.globalCellIndex][hInfo.globalCellIndex], hInfo, vInfo, cancelTextCut);
                const info = new CellNavigationInfo(hInfo.pageIndex, vInfo.pageIndex, vInfo.cellIndexOnPage, hInfo.cellIndexOnPage, cell);
                row.push(info);
            }
            matrix.push(row);
        }
        return matrix;
    }
    private _setTablePositionOnPage(page: IGanttPageExportInfo, tableKey: string, x: number, y: number): void {
        const table = this._getTableOrCreate(page, tableKey);
        table.position = new Point(x, y);
    }
    private _extendPageMatrixIfRequired(rowIndex: number, colIndex: number): void {
        this._pages ??= new Array<Array<IGanttPageExportInfo>>();
        for(let i = this._pages.length; i <= rowIndex; i++)
            this._pages.push(new Array<IGanttPageExportInfo>());
        const row = this._pages[rowIndex];
        for(let i = row.length; i <= colIndex; i++)
            row.push(this._createPage());
    }
    private _getTableAndExtendIfRequired(page: IGanttPageExportInfo, tableKey: string, rowIndex: number, colIndex: number): IGanttTableExportInfo {
        const table = this._getTableOrCreate(page, tableKey);
        const cells = table.cells;
        for(let i = cells.length; i <= rowIndex; i++)
            cells.push(new Array<CellDef>());
        const row = cells[rowIndex];
        for(let i = row.length; i <= colIndex; i++)
            row.push(new CellDef());
        return table;
    }
    private _createPage(): IGanttPageExportInfo {
        return {
            objects: {
                tasks: null,
                dependencies: null,
                resources: null,
                timeMarkers: null
            },
            tables: { }
        };
    }
    private _createTable(tableKey: string): IGanttTableExportInfo {
        const globalTableInfo = this._globalInfo?.tables[tableKey] as IGanttTableExportInfo;
        return {
            name: tableKey,
            size: null,
            position: null,
            style: globalTableInfo.style,
            baseCellSize: globalTableInfo.baseCellSize,
            cells: new Array<Array<CellDef>>(),
            hideRowLines: globalTableInfo.hideRowLines
        };
    }
    private _addCellToPage(page: IGanttPageExportInfo, tableKey: string, cellInfo: CellNavigationInfo): void {
        const rowIndex = cellInfo.cellRowIndexOnPage;
        const colIndex = cellInfo.cellColIndexOnPage;
        const table = this._getTableAndExtendIfRequired(page, tableKey, rowIndex, colIndex);
        table.cells[rowIndex][colIndex].assign(cellInfo.cell);
    }
    private _updateTableSizeOnPages(tableKey: string):void {
        const colCount = this._pages[0]?.length;
        const rowCount = this._pages.length;
        for(let i = 0; i < rowCount; i++)
            for(let j = 0; j < colCount; j++)
                this._updateTableSizeOnPage(this._pages[i][j], tableKey);
    }
    private _updateTableSizeOnPage(page: IGanttPageExportInfo, tableKey: string): void {
        const table = page?.tables[tableKey] as IGanttTableExportInfo;
        if(table) {
            const rowCount = table.cells.length;
            const height = rowCount * table.baseCellSize.height || 0;
            const width = table.cells[0]?.reduce((acc, v, i) => acc += this._getCellWidth(table, 0, i), 0) || 0;
            table.size = new Size(width, height);
        }
    }

    private _getTableNavigationVector(start: PageNavigation, table: IGanttTableExportInfo, isVertical: boolean = false, rowIndex: number = 0): Array<VectorInfo> {
        const vector = new Array<VectorInfo>();
        const pageNav = PageNavigation.createFrom(start);
        const length = isVertical ? table.cells?.length : table.cells[rowIndex]?.length;
        for(let i = 0; i < length; i++) {
            const cellSize = isVertical ? table.baseCellSize.height : this._getCellWidth(table, rowIndex, i);
            this._placeCell(vector, pageNav, i, cellSize, isVertical);
        }
        return vector;
    }
    private _placeCell(vector: Array<VectorInfo>, pageNav: PageNavigation, cellGlobalIndex: number, size: number, isVertical: boolean): void {
        const startPageIndex = isVertical ? pageNav.vIndex : pageNav.hIndex;
        let pageOffsetIndex = vector[vector.length - 1]?.pageOffset ?? cellGlobalIndex;
        let unplacedSize = size;
        let spaceToBorder = pageNav.getSpaceToBorder(isVertical);
        pageNav.offsetOneD(size, isVertical);
        const endPageIndex = isVertical ? pageNav.vIndex : pageNav.hIndex;
        if(!isVertical)
            for(let i = startPageIndex; i < endPageIndex; i++) {
                const info = new VectorInfo(i, cellGlobalIndex, pageOffsetIndex, spaceToBorder);
                pageOffsetIndex = cellGlobalIndex;
                vector.push(info);
                unplacedSize -= spaceToBorder;
                spaceToBorder = pageNav.getPageSize(isVertical);
            }
        if(endPageIndex !== startPageIndex)
            pageOffsetIndex = cellGlobalIndex;

        const isCutted = unplacedSize !== size;
        const info = new VectorInfo(endPageIndex, cellGlobalIndex, pageOffsetIndex, isCutted ? unplacedSize : null);
        vector.push(info);
    }
    private _prepareCuttedCell(originCell: CellDef, hInfo: VectorInfo, vInfo: VectorInfo, cancelTextCut?: boolean): CellDef {
        const cell = new CellDef(originCell);
        if(hInfo.isCutted) {
            const width = hInfo.cutSize;
            if(!cancelTextCut) {
                const text = cell.content;
                const style = originCell.styles;
                const leftPadding = style && style.cellPadding.left || 0;
                const rightPadding = style && style.cellPadding.right || 0;
                const textWidth = width - leftPadding - rightPadding;
                const parts = this._pdfDoc.splitTextToSize(text, textWidth);
                originCell.content = text.replace(parts[0], "");
                cell.content = parts[0];
            }
            cell.styles.cellWidth.assign(width);
        }
        if(vInfo.isCutted)
            cell.styles.minCellHeight = vInfo.cutSize;
        return cell;
    }
    private _getCellWidth(table: IGanttTableExportInfo, rowIndex: number, colIndex: number) {
        const cell = table.cells[rowIndex][colIndex];
        const style = cell.styles;
        const numWidth = style.cellWidth.getValue() as number;
        const width = numWidth ?? style.minCellWidth;
        return width ?? table.baseCellSize.width * (cell.colSpan ?? 1);
    }
    private _getTaskPagination(task: PdfTaskInfo, isVertical?: boolean): Array<Record<string, any>> {
        const size = isVertical ? task.height : task.width;
        const startPos = isVertical ? task.top : task.left;
        return this._getLinePagination(startPos, size, isVertical);
    }
    private _getDependencyLinePagination(dependency: PdfDependencyLineInfo, isVertical?: boolean): Array<Record<string, any>> {
        const lineStart = dependency.points[0];
        const lineEnd = dependency.points[1];
        const size = isVertical ? lineEnd.y - lineStart.y : lineEnd.x - lineStart.x;
        const startPos = isVertical ? lineStart.y : lineStart.x;
        return this._getLinePagination(startPos, size, isVertical);
    }
    private _getTimeMarkerPagination(timeMarker: PdfTimeMarkerInfo, isVertical?: boolean): Array<Record<string, any>> {
        const size = isVertical ? timeMarker.size.height : timeMarker.size.width;
        const start = isVertical ? timeMarker.start.y : timeMarker.start.x;
        return this._getLinePagination(start, size, isVertical);
    }
    private _getLinePagination(globalStart: number, size: number, isVertical?: boolean): Array<Record<string, any>> {
        const result = new Array<Record<string, any>>();
        const pageNav = this.pageNavigator.clone();
        pageNav.offsetOneD(globalStart, isVertical);
        const startPageIndex = isVertical ? pageNav.vIndex : pageNav.hIndex;
        pageNav.offsetOneD(size, isVertical);
        const endPageIndex = isVertical ? pageNav.vIndex : pageNav.hIndex;
        for(let i = startPageIndex; i <= endPageIndex; i++)
            result.push({
                offset: pageNav.getPageGlobalOffset(i, isVertical),
                pageIndex: i
            });
        return result;
    }
    private _getPointPageInfo(p: Point): Record<string, any> {
        const pageNav = this.pageNavigator.clone();
        pageNav.offset(p.x, p.y);
        return {
            offsetX: pageNav.getPageGlobalOffset(pageNav.hIndex),
            offsetY: pageNav.getPageGlobalOffset(pageNav.vIndex, true),
            pageHorIndex: pageNav.hIndex,
            pageVerIndex: pageNav.vIndex
        };
    }
    protected get pageWidth(): number {
        return this._pdfDoc?.getPageWidth();
    }
    protected get pageHeight(): number {
        return this._pdfDoc?.getPageHeight();
    }
    protected get pageLeftMargin(): number {
        return this._props?.margins.left;
    }
    protected get pageTopMargin(): number {
        return this._props?.margins.top;
    }
    protected get pageRightMargin(): number {
        return this._props?.margins.right;
    }
    protected get pageBottomMargin(): number {
        return this._props?.margins.bottom;
    }
    protected get pageLeft(): number {
        this._pageLeft ??= this.pageLeftMargin;
        return this._pageLeft;
    }
    protected get pageRight(): number {
        this._pageRight ??= this.pageWidth - this.pageRightMargin;
        return this._pageRight;
    }
    protected get pageTop(): number {
        this._pageTop ??= this.pageTopMargin;
        return this._pageTop;
    }
    protected get pageBottom(): number {
        this._pageBottom ??= this.pageHeight - this.pageBottomMargin;
        return this._pageBottom;
    }
    protected get pageBorders(): Record<string, number> {
        return {
            left: this.pageLeft,
            top: this.pageTop,
            bottom: this.pageBottom,
            right: this.pageRight
        };
    }
    protected get correctedPageBottoms(): Array<number> {
        this._correctedPageBottoms ??= this._getCorrectedPagesBottom();
        return this._correctedPageBottoms;
    }
    protected get pageNavigator(): PageNavigation {
        this._pageNavigator ??= new PageNavigation(this.pageBorders, 0, 0, 0, 0, this.correctedPageBottoms);
        return this._pageNavigator;
    }
    public _getCorrectedPagesBottom(): Array<number> {
        const result = new Array<number>();
        const tables = this._globalInfo?.tables;
        const referenceTable = tables[PdfPageTableNames.treeListMain] ?? tables[PdfPageTableNames.chartMain];
        const nav = new PageNavigation(this.pageBorders);
        nav.pageY = referenceTable.position.y;
        for(let i = 0; i < referenceTable.cells.length; i++) {
            const cell = referenceTable.cells[i][0];
            const height = cell.styles?.minCellHeight ?? referenceTable.baseCellSize.height;
            const prevPageIndex = nav.vIndex;
            const prevPageY = nav.pageY;
            nav.offsetOneD(height, true);
            if(prevPageIndex !== nav.vIndex) {
                result.push(prevPageY);
                nav.pageY = nav.getPageStart(true) + height;
            }
        }
        return result;
    }
    private _addTaskToPage(pageVIndex: number, pageHIndex: number, task: PdfTaskInfo): void {
        const page = this._getPage(pageVIndex, pageHIndex);
        if(page) {
            page.objects.tasks ??= new Array<PdfTaskInfo>();
            page.objects.tasks.push(task);
        }
    }
    private _addDependencyToPage(pageVIndex: number, pageHIndex: number, dependency: PdfDependencyLineInfo): void {
        const page = this._getPage(pageVIndex, pageHIndex);
        if(page) {
            page.objects.dependencies ??= new Array<PdfDependencyLineInfo>();
            page.objects.dependencies.push(dependency);
        }
    }
    private _addResourceToPage(pageVIndex: number, pageHIndex: number, resource: PdfTaskResourcesInfo): void {
        const page = this._getPage(pageVIndex, pageHIndex);
        if(page) {
            page.objects.resources ??= new Array<PdfTaskResourcesInfo>();
            page.objects.resources.push(resource);
        }
    }
    private _addTimeMarkerToPage(pageVIndex: number, pageHIndex: number, timeMarker: PdfTimeMarkerInfo): void {
        const page = this._getPage(pageVIndex, pageHIndex);
        if(page) {
            page.objects.timeMarkers ??= new Array<PdfTimeMarkerInfo>();
            page.objects.timeMarkers.push(timeMarker);
        }
    }
    private _offsetPoints(points: Array<Point>, offsetX: number, offsetY: number): void {
        points.forEach(p => {
            p.x -= offsetX;
            p.y -= offsetY;
        });
    }
}
