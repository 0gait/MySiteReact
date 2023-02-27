import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectionPointSide } from "../../DiagramItem";
import { ConnectorPointsOrthogonalCalculator } from "./ConnectorPointsOrthogonalCalculator";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";
import { Connector } from "../Connector";

export abstract class ConnectorPointsOrthogonalSideCalculatorBase {
    constructor(public parent: ConnectorPointsOrthogonalCalculator) { }

    get connector() { return this.parent.connector; }
    get beginRect() { return this.parent.beginRect; }
    get endRect() { return this.parent.endRect; }

    getBeginOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        originPoint = this.getCorrectOriginPoint(originPoint, originRect);
        if(targetSide !== ConnectionPointSide.Undefined) {
            if(this.isBeginEndSame())
                return this.getSameShapeOffsetPoints(targetSide, originPoint, targetPoint, originRect);
            else if(this.isBeginEndOverlappedPoints(originPoint, targetPoint))
                return this.getOverlappedPointsOffsetPoints(targetSide, originPoint, targetPoint, originRect);
            else if(this.isBeginEndOverlapped())
                return this.getBeginOverlappedShapeOffsetPoints(targetSide, originPoint, targetPoint, originRect);
        }
        else if(this.isOriginRectContainsTargetPoint(originRect, targetPoint))
            return this.getOverlappedPointsOffsetPoints(targetSide, originPoint, targetPoint, originRect);
        if(this.isOnSidePoint(originPoint, targetPoint))
            return this.getBeginOnSideOffsetPoints(targetSide, originPoint, targetPoint, originRect);
        return this.getBeginOffSideOffsetPoints(targetSide, originPoint, targetPoint, originRect);
    }
    getEndOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        originPoint = this.getCorrectOriginPoint(originPoint, originRect);
        if(targetSide !== ConnectionPointSide.Undefined) {
            if(this.isBeginEndSame())
                return this.getSameShapeOffsetPoints(targetSide, originPoint, targetPoint, originRect);
            else if(this.isBeginEndOverlappedPoints(targetPoint, originPoint))
                return this.getOverlappedPointsOffsetPoints(targetSide, originPoint, targetPoint, originRect);
            else if(this.isBeginEndOverlapped())
                return this.getEndOverlappedShapeOffsetPoints(targetSide, originPoint, targetPoint, originRect);
        }
        else if(this.isOriginRectContainsTargetPoint(originRect, targetPoint))
            return this.getOverlappedPointsOffsetPoints(targetSide, originPoint, targetPoint, originRect);
        if(this.isOnSidePoint(originPoint, targetPoint))
            return this.getEndOnSideOffsetPoints(targetSide, originPoint, targetPoint, originRect);
        return this.getEndOffSideOffsetPoints(targetSide, originPoint, targetPoint, originRect);
    }

    abstract getCorrectOriginPoint(originPoint: ConnectorRenderPoint, originRect: Rectangle);
    abstract getSameShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getOverlappedPointsOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getBeginOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getEndOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getBeginOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getEndOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getBeginOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract getEndOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[];
    abstract isOnSidePoint(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean;

    abstract isDirectConnectionAllowed(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean;
    abstract getDirectConnectionPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): ConnectorRenderPoint[];

    getSide(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): ConnectionPointSide {
        const diffX = Math.abs(targetPoint.x - originPoint.x);
        const diffY = Math.abs(targetPoint.y - originPoint.y);
        if(diffX > diffY)
            if(targetPoint.x > originPoint.x)
                return ConnectionPointSide.East;
            else
                return ConnectionPointSide.West;

        else
        if(targetPoint.y > originPoint.y)
            return ConnectionPointSide.South;
        else
            return ConnectionPointSide.North;

    }
    getSideCalculator(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): ConnectorPointsOrthogonalSideCalculatorBase {
        return this.parent.getSideCalculator(this.getSide(originPoint, targetPoint));
    }
    getMinOffset(): number {
        return Connector.minOffset;
    }
    isBeginEndSame(): boolean {
        return this.connector.beginItem === this.connector.endItem;
    }
    isBeginEndOverlapped(): boolean {
        return this.beginRect && this.endRect && Rectangle.areIntersected(this.beginRect, this.endRect);
    }
    isBeginEndOverlappedX(): boolean {
        return this.beginRect && this.endRect && !!Rectangle.getHorizIntersection(this.beginRect, this.endRect);
    }
    isBeginEndOverlappedY(): boolean {
        return this.beginRect && this.endRect && !!Rectangle.getVertIntersection(this.beginRect, this.endRect);
    }
    isBeginEndOverlappedPoints(beginPoint: ConnectorRenderPoint, endPoint: ConnectorRenderPoint): boolean {
        return this.beginRect && this.endRect && (this.beginRect.containsPoint(endPoint) || this.endRect.containsPoint(beginPoint));
    }
    isOriginRectContainsTargetPoint(originRect: Rectangle, targetPoint: ConnectorRenderPoint): boolean {
        return originRect && targetPoint && originRect.containsPoint(targetPoint);
    }
}
