import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ConnectionPointSide } from "../../DiagramItem";
import { ConnectorPointsOrthogonalCalculator } from "./ConnectorPointsOrthogonalCalculator";
import { ConnectorPointsOrthogonalSideCalculatorBase } from "./ConnectorPointsOrthogonalSideCalculatorBase";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";

export class ConnectorPointsOrthogonalUndefinedSideCalculator extends ConnectorPointsOrthogonalSideCalculatorBase {
    constructor(parent: ConnectorPointsOrthogonalCalculator) {
        super(parent);
    }

    getCorrectOriginPoint(originPoint: Point, originRect: Rectangle) {
        return originPoint;
    }
    getSameShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getOverlappedPointsOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getBeginOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getEndOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getBeginOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getEndOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getBeginOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    getEndOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: Point, targetPoint: Point, originRect: Rectangle): ConnectorRenderPoint[] {
        return [];
    }
    isOnSidePoint(originPoint: Point, targetPoint: Point): boolean {
        return true;
    }

    isDirectConnectionAllowed(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean {
        const calculator = this.getSideCalculator(originPoint, targetPoint);
        if(calculator !== undefined)
            return calculator.isDirectConnectionAllowed(targetSide, originPoint, targetPoint);
        return true;
    }
    getDirectConnectionPoints(originPoint: Point, targetPoint: Point): ConnectorRenderPoint[] {
        const diffX = Math.abs(targetPoint.x - originPoint.x);
        const diffY = Math.abs(targetPoint.y - originPoint.y);
        if(diffX > diffY) {
            const minX = Math.min(originPoint.x, targetPoint.x);
            const cx = minX + diffX / 2;
            return [
                new ConnectorRenderPoint(cx, originPoint.y),
                new ConnectorRenderPoint(cx, targetPoint.y)
            ];
        }
        else {
            const minY = Math.min(originPoint.y, targetPoint.y);
            const cy = minY + diffY / 2;
            return [
                new ConnectorRenderPoint(originPoint.x, cy),
                new ConnectorRenderPoint(targetPoint.x, cy)
            ];
        }
    }
}
