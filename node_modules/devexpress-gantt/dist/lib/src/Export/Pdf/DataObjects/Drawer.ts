import { Position, TaskTitlePosition } from "../../../View/Helpers/Enums";
import { IGanttObjectExportInfo } from "../Interfaces";
import { EllipsisHelper } from "../Table/Ellipsis";
import { PdfDependencyLineInfo } from "./DependencyLineInfo";
import { PdfTaskInfo } from "./TaskInfo";
import { PdfTimeMarkerInfo } from "./TimeMarkerInfo";

export class PdfObjectDrawer {
    private _FONT_ROW_RATIO = 1.15;

    private _info: IGanttObjectExportInfo;
    private _pdfDoc;

    constructor(pdfDoc: any, info: IGanttObjectExportInfo) {
        this._info = info;
        this._pdfDoc = pdfDoc;
    }
    public draw(): void {
        this.drawTimeMarkers();
        this.drawDependencies();
        this.drawTasks();
        this.drawResources();
    }
    public drawTasks(): void {
        const tasks = this._info?.tasks;
        if(tasks)
            tasks.forEach(t => this.drawTask(t));
    }
    protected drawTask(info: PdfTaskInfo): void {
        const pdfDoc = this._pdfDoc;
        pdfDoc.setFillColor(...info.taskColor.getRBGColor());
        pdfDoc.setDrawColor(...info.taskColor.getRBGColor());
        if(info.isMilestone)
            this.drawMilestone(info);
        else
            this.drawRegularTask(info);
    }
    protected drawMilestone(info: PdfTaskInfo): void {
        const pdfDoc = this._pdfDoc;
        const x1 = info.sidePoints[0].x;
        const y1 = info.sidePoints[0].y;
        const x2 = info.sidePoints[1].x;
        const y2 = info.sidePoints[1].y;
        const x3 = info.sidePoints[2].x;
        const y3 = info.sidePoints[2].y;
        const x4 = info.sidePoints[3].x;
        const y4 = info.sidePoints[3].y;
        pdfDoc.triangle(x1, y1, x2, y2, x3, y3, "FD");
        pdfDoc.triangle(x1, y1, x4, y4, x3, y3, "FD");
    }
    protected drawRegularTask(info: PdfTaskInfo): void {
        const pdfDoc = this._pdfDoc;
        pdfDoc.rect(info.left, info.top, info.width, info.height, "FD");
        if(info.isParent)
            this.drawParentBorder(info);

        if(info.progressWidth) {
            pdfDoc.setFillColor(...info.progressColor.getRBGColor());
            pdfDoc.rect(info.left, info.top, info.progressWidth, info.height, "F");
        }
        if(info.text)
            this.printTaskTitle(info);
    }
    protected drawParentBorder(info: PdfTaskInfo): void {
        const pdfDoc = this._pdfDoc;
        const left = info.sidePoints[0].x;
        const top = info.sidePoints[1].y;
        const bottom = info.sidePoints[3].y;
        const right = info.sidePoints[2].x;
        const height = info.sidePoints[3].y - info.sidePoints[1].y;

        const leftBorderColor = info.progressWidth > height ? info.progressColor.getRBGColor() : info.taskColor.getRBGColor();
        pdfDoc.setFillColor(...leftBorderColor);
        pdfDoc.triangle(left, top, left, bottom, left + height, top, "FD");
        pdfDoc.setFillColor(...info.taskColor.getRBGColor());
        pdfDoc.triangle(right, top, right, bottom, right - height, top, "FD");
    }
    protected printTaskTitle(info: PdfTaskInfo): void {
        const pdfDoc = this._pdfDoc;
        const style = info.textStyle;
        const colorArray = style && style.textColor.getRBGColor();
        const fontSize = style && style.fontSize;
        pdfDoc.setTextColor(...colorArray);
        pdfDoc.setFontSize(fontSize);

        let textPosX;
        let textPosY = info.top + fontSize * this._FONT_ROW_RATIO / pdfDoc.internal.scaleFactor;
        if(info.isParent)
            textPosY -= PdfTaskInfo.defaultParentHeightCorrection;

        const leftPadding = style && style.cellPadding.left || 0;
        const rightPadding = style && style.cellPadding.right || 0;

        if(info.textPosition === TaskTitlePosition.Inside) {
            const textWidth = info.width - leftPadding - rightPadding;
            textPosX = info.left + leftPadding;
            pdfDoc.text(EllipsisHelper.limitPdfTextWithEllipsis(info.text, pdfDoc, textWidth), textPosX, textPosY);
        }
        else {
            textPosX = info.left - rightPadding;
            pdfDoc.text(info.text, textPosX, textPosY, { align: "right" });
        }
    }

    public drawDependencies(): void {
        const dependencies = this._info?.dependencies;
        if(dependencies)
            dependencies.forEach(d => this.drawDependencyLine(d));
    }
    protected drawDependencyLine(line: PdfDependencyLineInfo): void {
        this._pdfDoc.setFillColor(...line.fillColor.getRBGColor());
        this._pdfDoc.setDrawColor(...line.fillColor.getRBGColor());

        if(line.arrowInfo)
            this.drawArrow(line);
        else {
            const points = line.points;
            this._pdfDoc.line(points[0].x, points[0].y, points[1].x, points[1].y);
        }
    }
    protected isValidLine(line: PdfDependencyLineInfo): boolean {
        const points = line.points;
        return !isNaN(points[0].x) && !isNaN(points[0].y) && !isNaN(points[1].x) && !isNaN(points[1].y);
    }
    protected drawArrow(line: PdfDependencyLineInfo): void {
        const width = line.arrowInfo.width || 0;
        const left = line.points[0].x;
        const top = line.points[0].y;

        switch(line.arrowInfo.position) {
            case Position.Left:
                this._pdfDoc.triangle(left, top + width, left + width, top, left + width, top + 2 * width, "FD");
                break;
            case Position.Right:
                this._pdfDoc.triangle(left, top, left, top + 2 * width, left + width, top + width, "FD");
                break;
            case Position.Top:
                this._pdfDoc.triangle(left, top + width, left + width, top, left + 2 * width, top + width, "FD");
                break;
            case Position.Bottom:
                this._pdfDoc.triangle(left, top, left + width, top + width, left + 2 * width, top, "FD");
                break;
        }
    }
    public drawResources(): void {
        const pdfDoc = this._pdfDoc;
        const resources = this._info?.resources;
        if(resources)
            resources.forEach(r => {
                pdfDoc.setFontSize(r.style.fontSize ?? 11);
                const textPosY = r.y + r.style.fontSize * this._FONT_ROW_RATIO / pdfDoc.internal.scaleFactor;
                const paddingLeft = r.style.cellPadding.left ?? 0;
                const paddingRight = r.style.cellPadding.right ?? 1;
                const resWidth = Math.max(r.style.cellWidth.getValue() as number, paddingLeft + pdfDoc.getTextWidth(r.text) + paddingRight);
                pdfDoc.setFillColor(...r.style.fillColor.getRBGColor());
                pdfDoc.rect(r.x, r.y, resWidth, r.style.minCellHeight, "F");
                pdfDoc.setTextColor(...r.style.textColor.getRBGColor());
                pdfDoc.text(r.text, r.x + paddingLeft, textPosY);
            });
    }
    public drawTimeMarkers(): void {
        const markers = this._info?.timeMarkers;
        markers?.forEach(m => this.drawTimeMarker(m));
    }
    protected drawTimeMarker(marker: PdfTimeMarkerInfo): void {
        const pdfDoc = this._pdfDoc;
        const isInterval = marker.size.width > 1;
        const x = marker.start.x;
        const y = marker.start.y;
        const width = marker.size.width;
        const height = marker.size.height;
        const needDrawBorders = marker.isStripLine;
        if(isInterval) {
            pdfDoc.setFillColor(...marker.color.getRBGColor());
            pdfDoc.saveGraphicsState();
            pdfDoc.setGState(new pdfDoc.GState({ opacity: marker.color.opacity ?? 1 }));
            pdfDoc.rect(x, y, width, height, "F");
            pdfDoc.restoreGraphicsState();
        }
        if(needDrawBorders) {
            this._pdfDoc.setLineDashPattern([3]);
            this._pdfDoc.setDrawColor(...marker.lineColor.getRBGColor());
            if(isInterval)
                this._pdfDoc.line(x + width, y, x + width, y + height, "S");
            this._pdfDoc.line(x, y, x, y + height, "S");
            this._pdfDoc.setLineDashPattern(); 
        }
    }
}
