import { Point } from "@devexpress/utils/lib/geometry/point";
import { Segment } from "@devexpress/utils/lib/geometry/segment";

export class ConnectorProhibitedSegments<TPoint extends Point> {
    readonly segments: Segment<TPoint>[] = [];
    readonly exludedPoints: { [key: string]: TPoint } = {};

    addSegment(segment: Segment<TPoint>): void {
        this.segments.push(segment);
    }
    addExludedPoint(point: TPoint): void {
        this.exludedPoints[point.toString()] = point;
    }
    allowPoint(point: TPoint): boolean {
        if(this.exludedPoints[point.toString()] === undefined)
            for(let i = 0; i < this.segments.length; i++)
                if(this.segments[i].containsPoint(point))
                    return false;
        return true;
    }
}
