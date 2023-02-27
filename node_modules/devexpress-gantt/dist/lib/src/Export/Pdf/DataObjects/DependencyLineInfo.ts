import { Point } from "@devexpress/utils/lib/geometry/point";
import { Color } from "../Table/Color";

export class PdfDependencyLineInfo {

    public points: Array<Point>;
    public arrowInfo: Record<string, any>;
    public fillColor: Color;

    public assign(source: PdfDependencyLineInfo): void {
        this._copyPoints(source.points);
        this.arrowInfo = source.arrowInfo;
        this.fillColor ??= new Color();
        this.fillColor.assign(source.fillColor);
    }
    private _copyPoints(source: Array<Point>) {
        this.points = new Array<Point>();
        source?.forEach(p => this.points.push(new Point(p.x, p.y)));
    }
}
