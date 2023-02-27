import { Point } from "@devexpress/utils/lib/geometry/point";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { ConnectorProhibitedSegments } from "./ConnectorProhibitedSegments";

export class ConnectorRenderSegment<TPoint extends Point> {
    constructor(
        readonly startInfo: Segment<TPoint> | TPoint,
        readonly endInfo: Segment<TPoint> | TPoint,
        readonly startPointIndex: number,
        readonly previousCustomSegment: Segment<TPoint>) {
    }
    get startPathPoint(): TPoint {
        return this.startInfo instanceof Segment ? this.startInfo.endPoint : this.startInfo;
    }
    get endPathPoint(): TPoint {
        return this.endInfo instanceof Segment ? this.endInfo.startPoint : this.endInfo;
    }
    get startPoint(): TPoint {
        return this.startInfo instanceof Segment ? this.startInfo.startPoint : this.startInfo;
    }
    get endPoint(): TPoint {
        return this.endInfo instanceof Segment ? this.endInfo.endPoint : this.endInfo;
    }

    createGridPoints() : Point[] {
        const result = [];
        if(this.endInfo instanceof Segment) {
            result.push(this.endInfo.startPoint);
            result.push(this.endInfo.endPoint);
        }
        else
            result.push(this.endInfo);
        return result;
    }
    createProhibitedSegments(): ConnectorProhibitedSegments<TPoint> {
        if(this.startInfo instanceof Segment) {
            const result = this.createProhibitedSegmentsCore(this.startInfo);
            if(this.endInfo instanceof Segment) {
                result.addSegment(this.endInfo);
                result.addExludedPoint(this.endInfo.startPoint);
            }
            if(this.previousCustomSegment)
                result.addSegment(this.previousCustomSegment);
            return result;
        }
        if(this.endInfo instanceof Segment) {
            const result = this.createProhibitedSegmentsCore(this.endInfo);
            result.addExludedPoint(this.endInfo.startPoint);
            if(this.previousCustomSegment)
                result.addSegment(this.previousCustomSegment);
            return result;
        }
        return this.previousCustomSegment ? this.createProhibitedSegmentsCore(this.previousCustomSegment) : undefined;
    }

    private createProhibitedSegmentsCore(segment: Segment<TPoint>) {
        const result = new ConnectorProhibitedSegments<TPoint>();
        result.addSegment(segment);
        return result;
    }
}
