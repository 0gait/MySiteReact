import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { PdfDependencyLineInfo } from "./DataObjects/DependencyLineInfo";
import { PdfTaskInfo } from "./DataObjects/TaskInfo";
import { PdfTaskResourcesInfo } from "./DataObjects/TaskResourcesInfo";
import { PdfTimeMarkerInfo } from "./DataObjects/TimeMarkerInfo";
import { GanttPdfExportProps } from "./Settings/Props";
import { CellDef } from "./Table/CellDef";
import { StyleDef } from "./Table/StyleDef";

export interface IGanttObjectExportInfo {
    tasks: Array<PdfTaskInfo>;
    dependencies: Array<PdfDependencyLineInfo>;
    resources: Array<PdfTaskResourcesInfo>;
    timeMarkers: Array<PdfTimeMarkerInfo>;
}

export interface IGanttTableExportInfo {
    name?: string;
    position: Point;
    size: Size;
    baseCellSize: Size;
    style: StyleDef;
    cells: Array<Array<CellDef>>;
    hideRowLines?: boolean;
}

export interface IGanttPageExportInfo {
    objects: IGanttObjectExportInfo;
    tables: Record<string, IGanttTableExportInfo>;
}

export interface IGanttExportInfo {
    getPages(pdfDoc: any): Array<IGanttPageExportInfo>;
    settings: GanttPdfExportProps;
}

export class PdfPageTableNames {
    public static treeListHeader = "treeListHeader";
    public static treeListMain = "treeListMain";
    public static chartMain = "chartMain";
    public static chartScaleTop = "chartScaleTop";
    public static chartScaleBottom = "chartScaleBottom";
}
