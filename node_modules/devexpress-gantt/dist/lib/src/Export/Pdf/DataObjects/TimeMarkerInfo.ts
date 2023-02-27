import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { Color } from "../Table/Color";

export class PdfTimeMarkerInfo {

    public start: Point;
    public size: Size;
    public lineColor: Color = new Color();
    public color: Color = new Color();
    public isStripLine: boolean;

    constructor(start?: Point, size?: Size, color?: Color, lineColor?: Color, isStripLine?: boolean) {
        if(start)
            this.start = new Point(start.x, start.y);
        if(size)
            this.size = new Size(size.width, size.height);
        if(color)
            this.color.assign(color);
        if(lineColor)
            this.lineColor.assign(lineColor);
        if(isDefined(isStripLine))
            this.isStripLine = isStripLine;
    }
    public assign(source: PdfTimeMarkerInfo): void {
        if(source) {
            this.start = new Point(source.start?.x, source.start?.y);
            this.size = new Size(source.size?.width, source.size?.height);
            this.isStripLine = source.isStripLine;
            this.color.assign(source.color);
            this.lineColor.assign(source.lineColor);
        }
    }
}
