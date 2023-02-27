import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectionPointSide } from "../../DiagramItem";
import { Connector } from "../Connector";
import { ConnectorPointsCalculatorBase } from "./ConnectorPointsCalculatorBase";
import { ConnectorPointsOrthogonalSideCalculatorBase } from "./ConnectorPointsOrthogonalSideCalculatorBase";
import { ConnectorPointsOrthogonalUndefinedSideCalculator } from "./ConnectorPointsOrthogonalUndefinedSideCalculator";
import { ConnectorPointsOrthogonalSouthSideCalculator } from "./ConnectorPointsOrthogonalSouthSideCalculator";
import { ConnectorPointsOrthogonalNorthSideCalculator } from "./ConnectorPointsOrthogonalNorthSideCalculator";
import { ConnectorPointsOrthogonalEastSideCalculator } from "./ConnectorPointsOrthogonalEastSideCalculator";
import { ConnectorPointsOrthogonalWestSideCalculator } from "./ConnectorPointsOrthogonalWestSideCalculator";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";
import { ModelUtils } from "../../ModelUtils";

export class ConnectorPointsOrthogonalCalculator extends ConnectorPointsCalculatorBase {
    sideCalculators: { [key: number]: ConnectorPointsOrthogonalSideCalculatorBase } = {};

    constructor(connector: Connector) {
        super(connector);

        this.sideCalculators[ConnectionPointSide.Undefined] = new ConnectorPointsOrthogonalUndefinedSideCalculator(this);
        this.sideCalculators[ConnectionPointSide.South] = new ConnectorPointsOrthogonalSouthSideCalculator(this);
        this.sideCalculators[ConnectionPointSide.North] = new ConnectorPointsOrthogonalNorthSideCalculator(this);
        this.sideCalculators[ConnectionPointSide.East] = new ConnectorPointsOrthogonalEastSideCalculator(this);
        this.sideCalculators[ConnectionPointSide.West] = new ConnectorPointsOrthogonalWestSideCalculator(this);
    }

    get beginRect(): Rectangle { return this.connector.beginItem ? this.connector.beginItem.rectangle : undefined; }
    get endRect(): Rectangle { return this.connector.endItem ? this.connector.endItem.rectangle : undefined; }

    getPoints(): ConnectorRenderPoint[] {
        const points = this.connector.points.map((pt, index) => new ConnectorRenderPoint(pt.x, pt.y, index));
        ModelUtils.removeUnnecessaryRenderPoints(points);

        let beginIndex = 0; let endIndex = points.length - 1;
        const beginSide = this.getPointSide(points, 0);
        const beginNextSide = this.getPointSide(points, 1);
        const endSide = this.getPointSide(points, points.length - 1);
        const endPrevSide = this.getPointSide(points, points.length - 1 - 1);

        const beginSideCalculator = this.getSideCalculator(beginSide);
        const endSideCalculator = this.getSideCalculator(endSide);

        const originRect = this.beginRect;
        const originPoint = beginSideCalculator.getCorrectOriginPoint(points[beginIndex], originRect);
        const targetPoint = points[beginIndex + 1];
        if(points.length === 2 && beginSideCalculator.isOnSidePoint(originPoint, targetPoint) &&
            beginSideCalculator.isDirectConnectionAllowed(beginNextSide, originPoint, targetPoint)) {
            const directConnectionPoints = beginSideCalculator.getDirectConnectionPoints(originPoint, targetPoint);
            directConnectionPoints.forEach(pt => {
                points.splice(beginIndex + 1, 0, pt);
                beginIndex++;
                endIndex++;
            });
        }
        else {
            const bOffsetPoints = beginSideCalculator.getBeginOffsetPoints(beginNextSide, points[beginIndex], points[beginIndex + 1], this.beginRect);
            bOffsetPoints.forEach(pt => {
                points.splice(beginIndex + 1, 0, pt);
            });
            beginIndex += bOffsetPoints.length;
            endIndex += bOffsetPoints.length;
            const eOffsetPoints = endSideCalculator.getEndOffsetPoints(endPrevSide, points[endIndex], points[endIndex - 1], this.endRect);
            eOffsetPoints.forEach((pt, index) => {
                points.splice(endIndex + index, 0, pt);
            });
            this.addMiddlePoints(points, beginIndex, endIndex);
        }
        ModelUtils.removeUnnecessaryRenderPoints(points);
        return points;
    }

    getSideCalculator(side: ConnectionPointSide): ConnectorPointsOrthogonalSideCalculatorBase {
        return this.sideCalculators[side];
    }
    getPointSide(points: ConnectorRenderPoint[], index: number): ConnectionPointSide {
        if(index === 0 && this.connector.beginItem) {
            const connectionPointIndex = this.connector.beginConnectionPointIndex;
            return this.connector.beginItem.getConnectionPointSideByIndex(connectionPointIndex, points[1]);
        }
        if(index === points.length - 1 && this.connector.endItem) {
            const connectionPointIndex = this.connector.endConnectionPointIndex;
            return this.connector.endItem.getConnectionPointSideByIndex(connectionPointIndex, points[points.length - 2]);
        }
        return ConnectionPointSide.Undefined;
    }
    addMiddlePoints(points: ConnectorRenderPoint[], beginIndex: number, endIndex: number): void {
        for(let index = beginIndex; index < endIndex; index++) {
            const nextIndex = index + 1;
            const middlePoint = this.getMiddlePoint(points[index], points[index - 1], index - 1 === 0,
                points[nextIndex], points[nextIndex + 1], nextIndex + 1 === points.length - 1);
            if(middlePoint !== undefined) {
                points.splice(index + 1, 0, middlePoint);
                index++;
                endIndex++;
            }
        }
    }
    getMiddlePoints(point1: ConnectorRenderPoint, point2: ConnectorRenderPoint): ConnectorRenderPoint[] {
        if(point1.x === point2.x || point1.y === point2.y)
            return [];
        return [
            new ConnectorRenderPoint(point1.x, point2.y),
            new ConnectorRenderPoint(point2.x, point1.y)
        ];
    }
    getMiddlePoint(point1: ConnectorRenderPoint, directionPoint1: ConnectorRenderPoint, nextToBegin: boolean,
        point2: ConnectorRenderPoint, directionPoint2: ConnectorRenderPoint, nextToEnd: boolean): ConnectorRenderPoint {
        let point: ConnectorRenderPoint;
        const points = this.getMiddlePoints(point1, point2);

        points.forEach(pt => {
            const rect1 = this.createPointsRect(point1, pt);
            const rect2 = this.createPointsRect(pt, point2);
            const itemRect1 = this.connector.beginItem ? this.connector.beginItem.rectangle : undefined;
            const itemRect2 = this.connector.endItem ? this.connector.endItem.rectangle : undefined;
            if(itemRect1)
                if(Rectangle.areIntersected(itemRect1, rect1) || Rectangle.areIntersected(itemRect1, rect2))
                    return;

            if(itemRect2)
                if(Rectangle.areIntersected(itemRect2, rect1) || Rectangle.areIntersected(itemRect2, rect2))
                    return;

            if((!this.isReturnPoint(pt, point1, directionPoint1) || this.isIntermediatePoints(point1, directionPoint1)) &&
                (!this.isReturnPoint(pt, point2, directionPoint2) || this.isIntermediatePoints(point2, directionPoint2)))
                if(point === undefined)
                    point = pt;
                else if(this.isPriorMiddlePoint(pt, point1, directionPoint1, point2, directionPoint2))
                    point = pt;

        });
        if(point === undefined && points.length > 0)
            point = points[0];
        return point;
    }
    createPointsRect(point1: ConnectorRenderPoint, point2: ConnectorRenderPoint): Rectangle {
        let result = Rectangle.fromPoints(point1, point2);
        if(result.width > 0)
            result = result.clone().inflate(-1, 0);
        if(result.height > 0)
            result = result.clone().inflate(0, -1);
        return result;

    }
    isPriorMiddlePoint(point: ConnectorRenderPoint,
        point1: ConnectorRenderPoint, directionPoint1: ConnectorRenderPoint,
        point2: ConnectorRenderPoint, directionPoint2: ConnectorRenderPoint): boolean {
        if(directionPoint1)
            if(point.x === directionPoint1.x || point.y === directionPoint1.y)
                return true;

        if(directionPoint2)
            if(point.x === directionPoint2.x || point.y === directionPoint2.y)
                return true;

        return false;
    }
    isReturnPoint(point: ConnectorRenderPoint, point1: ConnectorRenderPoint, point2: ConnectorRenderPoint): boolean {
        if(point1 !== undefined && point2 !== undefined) {
            if(point.x === point2.x)
                if(point1.y < point.y && point.y < point2.y || point1.y > point.y && point.y > point2.y)
                    return true;
            if(point.y === point2.y)
                if(point1.x < point.x && point.x < point2.x || point1.x > point.x && point.x > point2.x)
                    return true;
        }
        return false;
    }
    isIntermediatePoints(point1: ConnectorRenderPoint, point2: ConnectorRenderPoint): boolean {
        return 0 < point1.pointIndex && point1.pointIndex < this.connector.points.length - 1 &&
            0 < point2.pointIndex && point2.pointIndex < this.connector.points.length - 1;
    }

}
