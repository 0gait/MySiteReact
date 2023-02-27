import { Point } from "@devexpress/utils/lib/geometry/point";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { MathUtils } from "@devexpress/utils/lib/utils/math";

import { RightAngleTurnDirection } from "../AStarAlgorithm/AStarMetrics";
import { GeometryUtils } from "../../../../Utils";
import { ConnectionPointSide } from "../../../DiagramItem";

export class RightAngleConnectorRoutingMathOperations {
    static createUnionSegments<TPoint extends Point>(segments: Segment<TPoint>[], shouldCreateSegment : (prevEndPoint : TPoint, startNextPoint: TPoint) => boolean) : Segment<TPoint>[] {
        const result = [];
        let startRenderPoint = segments[0].startPoint;
        let endRenderPoint = segments[0].endPoint;
        for(let i = 1; i < segments.length; i++) {
            const currentSegment = segments[i];
            if(shouldCreateSegment(endRenderPoint, currentSegment.startPoint)) {
                result.push(new Segment(startRenderPoint.clone(), endRenderPoint.clone()));
                startRenderPoint = currentSegment.startPoint;
            }
            endRenderPoint = currentSegment.endPoint;
        }
        result.push(new Segment(startRenderPoint, endRenderPoint));
        return result;
    }
    static unionPoints<TPoint extends Point>(points: TPoint[]): void {
        let index = 0;
        while(index < points.length - 2)
            if(GeometryUtils.isCorner(points[index], points[index + 1], points[index + 2]))
                index++;
            else {
                points.splice(index + 1, 1);
                index = Math.max(0, index - 1);
            }
    }

    static getTurnDirection(angle: number): RightAngleTurnDirection {
        if(MathUtils.numberCloseTo(angle, 0))
            return RightAngleTurnDirection.Straight;
        if(MathUtils.numberCloseTo(angle, Math.PI))
            return RightAngleTurnDirection.Backwards;
        return angle < Math.PI ? RightAngleTurnDirection.Left : RightAngleTurnDirection.Right;
    }

    static isSegmentNormal<TPoint extends Point>(segment: Segment<TPoint>, isHorizontal : boolean) : boolean {
        return isHorizontal ? MathUtils.numberCloseTo(segment.startPoint.y, segment.endPoint.y) : MathUtils.numberCloseTo(segment.startPoint.x, segment.endPoint.x);
    }

    static isConnectionRectanleLineIntersected<TPoint extends Point>(rect: Rectangle, segment : Segment<TPoint>, side : ConnectionPointSide, excludeBeginPoint : boolean, excludeEndPoint: boolean, createPoint: (x: number, y: number) => TPoint) : boolean {
        switch(side) {
            case ConnectionPointSide.North:
                return GeometryUtils.isLineIntersected(createPoint(rect.x, rect.y), createPoint(rect.right, rect.y), segment, excludeBeginPoint, excludeEndPoint);
            case ConnectionPointSide.South:
                return GeometryUtils.isLineIntersected(createPoint(rect.right, rect.bottom), createPoint(rect.x, rect.bottom), segment, excludeBeginPoint, excludeEndPoint);
            case ConnectionPointSide.West:
                return GeometryUtils.isLineIntersected(createPoint(rect.x, rect.y), createPoint(rect.x, rect.bottom), segment, excludeBeginPoint, excludeEndPoint);
            case ConnectionPointSide.East:
                return GeometryUtils.isLineIntersected(createPoint(rect.right, rect.y), createPoint(rect.right, rect.bottom), segment, excludeBeginPoint, excludeEndPoint);
            default:
                return false;
        }
    }

    static createBeginConnectionSegment<TPoint extends Point>(beginConnectionSide: ConnectionPointSide, beginPoint: TPoint, offset: number, createPoint: (x: number, y: number) => TPoint): Segment<TPoint> | TPoint {
        switch(beginConnectionSide) {
            case ConnectionPointSide.North:
                return new Segment(beginPoint, createPoint(beginPoint.x, beginPoint.y - offset));
            case ConnectionPointSide.South:
                return new Segment(beginPoint, createPoint(beginPoint.x, beginPoint.y + offset));
            case ConnectionPointSide.West:
                return new Segment(beginPoint, createPoint(beginPoint.x - offset, beginPoint.y));
            case ConnectionPointSide.East:
                return new Segment(beginPoint, createPoint(beginPoint.x + offset, beginPoint.y));
            default:
                return beginPoint;
        }
    }
    static createEndConnectionSegment<TPoint extends Point>(endConnectionSide: ConnectionPointSide, endPoint: TPoint, offset: number, createPoint: (x: number, y: number) => TPoint): Segment<TPoint> | TPoint {
        switch(endConnectionSide) {
            case ConnectionPointSide.North:
                return new Segment(createPoint(endPoint.x, endPoint.y - offset), endPoint);
            case ConnectionPointSide.South:
                return new Segment(createPoint(endPoint.x, endPoint.y + offset), endPoint);
            case ConnectionPointSide.West:
                return new Segment(createPoint(endPoint.x - offset, endPoint.y), endPoint);
            case ConnectionPointSide.East:
                return new Segment(createPoint(endPoint.x + offset, endPoint.y), endPoint);
            default:
                return endPoint;
        }
    }
}
