import { Point } from "@devexpress/utils/lib/geometry/point";
import { PdfDependencyLineInfo } from "./DataObjects/DependencyLineInfo";
import { PdfTaskInfo } from "./DataObjects/TaskInfo";
import { PdfTaskResourcesInfo } from "./DataObjects/TaskResourcesInfo";
import { PdfTimeMarkerInfo } from "./DataObjects/TimeMarkerInfo";
import { IGanttObjectExportInfo, IGanttPageExportInfo, IGanttTableExportInfo, PdfPageTableNames } from "./Interfaces";
import { GanttPdfExportProps } from "./Settings/Props";
import { StyleDef } from "./Table/StyleDef";

export class ScalingHelper {
    static _defaultScaleFactor = 72 / 96; 

    private _doc: any;

    constructor(doc: any) {
        this._doc = doc;
    }

    private get _docScaleFactor(): number {
        return this._doc?.internal?.scaleFactor;
    }
    private get _correctScaleNeeded(): boolean {
        return this._docScaleFactor && Math.abs(this._docScaleFactor - ScalingHelper._defaultScaleFactor) > Number.EPSILON;
    }
    public getScaledSize(size: number): number {
        const size_in_pt = size * ScalingHelper._defaultScaleFactor;
        return size_in_pt / this._docScaleFactor;
    }
    public scalePageMargins(settings: GanttPdfExportProps): void {
        if(this._correctScaleNeeded) {
            if(settings?.margins?.left)
                settings.margins.left = this.getScaledSize(settings.margins.left);
            if(settings?.margins?.right)
                settings.margins.right = this.getScaledSize(settings.margins.right);
            if(settings?.margins?.top)
                settings.margins.top = this.getScaledSize(settings.margins.top);
            if(settings?.margins?.bottom)
                settings.margins.bottom = this.getScaledSize(settings.margins.bottom);
        }
    }

    public scaleSizes(info: IGanttPageExportInfo): void {
        if(this._correctScaleNeeded) {
            this.scaleTables(info);
            this.scaleObjects(info.objects);
        }
    }
    public scaleTables(info: IGanttPageExportInfo): void {
        if(info?.tables) {
            this.scaleTable(info.tables[PdfPageTableNames.treeListHeader]);
            this.scaleTable(info.tables[PdfPageTableNames.treeListMain]);
            this.scaleTable(info.tables[PdfPageTableNames.chartMain]);
            this.scaleTable(info.tables[PdfPageTableNames.chartScaleTop]);
            this.scaleTable(info.tables[PdfPageTableNames.chartScaleBottom]);
        }
    }

    public scaleTable(table: IGanttTableExportInfo): void {
        if(!table) return;

        if(table.size?.width)
            table.size.width = this.getScaledSize(table.size.width);
        if(table.size?.height)
            table.size.height = this.getScaledSize(table.size.height);
        if(table.position?.x)
            table.position.x = this.getScaledSize(table.position.x);
        if(table.position?.y)
            table.position.y = this.getScaledSize(table.position.y);
        if(table.baseCellSize?.width)
            table.baseCellSize.width = this.getScaledSize(table.baseCellSize.width);
        if(table.baseCellSize?.height)
            table.baseCellSize.height = this.getScaledSize(table.baseCellSize.height);
        if(table.cells)
            for(let i = 0; i < table.cells.length; i++) {
                const row = table.cells[i];
                for(let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    this.scaleStyle(cell.styles);
                }
            }
    }
    public scaleObjects(objects: IGanttObjectExportInfo): void {
        this.scaleTasks(objects?.tasks);
        this.scaleDependencies(objects?.dependencies);
        this.scaleResources(objects?.resources);
        this.scaleTimeMarkers(objects?.timeMarkers);
    }

    public scaleTasks(tasks: Array<PdfTaskInfo>): void {
        tasks?.forEach(t => {
            this.scalePoints(t.sidePoints);
            t.progressWidth = this.getScaledSize(t.progressWidth);
            this.scaleStyle(t.textStyle);
        });
    }

    public scaleDependencies(dependencies: Array<PdfDependencyLineInfo>): void {
        dependencies?.forEach(d => {
            this.scalePoints(d.points);
            if(d.arrowInfo?.width)
                d.arrowInfo.width = this.getScaledSize(d.arrowInfo.width);
        });
    }

    public scaleResources(resources: Array<PdfTaskResourcesInfo>): void {
        resources?.forEach(r => {
            r.x = this.getScaledSize(r.x);
            r.y = this.getScaledSize(r.y);
            this.scaleStyle(r.style);
        });
    }

    public scaleTimeMarkers(timeMarkers: Array<PdfTimeMarkerInfo>): void {
        timeMarkers?.forEach(m => {
            m.start.x = this.getScaledSize(m.start.x);
            m.start.y = this.getScaledSize(m.start.y);
            m.size.width = this.getScaledSize(m.size.width);
            m.size.height = this.getScaledSize(m.size.height);
        });
    }

    public scaleStyle(style: StyleDef): void {
        if(style) {
            const cellWidth = style.cellWidth;
            if(cellWidth?.hasValue()) {
                const scaled = this.getScaledSize(Number(cellWidth.getValue()));
                cellWidth.assign(scaled);
            }
            if(style.minCellHeight)
                style.minCellHeight = this.getScaledSize(style.minCellHeight);
            if(style.minCellWidth)
                style.minCellWidth = this.getScaledSize(style.minCellWidth);
            if(style.cellPadding?.left)
                style.cellPadding.left = this.getScaledSize(style.cellPadding.left);
            if(style.cellPadding?.right)
                style.cellPadding.right = this.getScaledSize(style.cellPadding.right);
            if(style.cellPadding?.top)
                style.cellPadding.top = this.getScaledSize(style.cellPadding.top);
            if(style.cellPadding?.bottom)
                style.cellPadding.bottom = this.getScaledSize(style.cellPadding.bottom);
        }
    }
    public scalePoints(points: Array<Point>): void {
        points?.forEach(p => {
            p.x = this.getScaledSize(p.x);
            p.y = this.getScaledSize(p.y);
        });
    }
}

