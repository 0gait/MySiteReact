import { Point } from "@devexpress/utils/lib/geometry/point";
import { Metrics } from "@devexpress/utils/lib/geometry/metrics";

import { DiagramItem } from "../../../DiagramItem";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectorRoutingPenaltyDescription } from "../ConnectorRoutingModel";

export enum RightAngleTurnDirection {
    Straight,
    Left,
    Right,
    Backwards
}

export interface IAStarMetrics<TPoint extends Point, TDirection> {
    distance(point1: TPoint, point2: TPoint): number;
    penalty(distance: number, position: Point, turnDirection: TDirection, intersectedItems: DiagramItem[]): number;
}

export class IntersectedShapeMetrics {
    constructor(
        readonly description: ConnectorRoutingPenaltyDescription,
        readonly shapeMargin: number) { }

    penalty(oldValue: number, distance: number, position: Point, item: DiagramItem) : number {
        const rectangle = item.rectangle;
        if(rectangle.containsPoint(position))
            return oldValue + this.description.shape * distance;
        const relativePenalty = this.createRelativeMarginPenalty(position, rectangle, this.shapeMargin);
        if(relativePenalty > 0)
            return oldValue + this.description.margin * relativePenalty * distance;
        return oldValue;
    }

    private createRelativeMarginPenalty(point: Point, rectangle: Rectangle, margin: number): number {
        const isTopPosition = this.isTopPosition(point, rectangle, margin);
        const isLeftPosition = this.isLeftPosition(point, rectangle, margin);
        const isBottomPosition = this.isBottomPosition(point, rectangle, margin);
        const isRightPosition = this.isRightPosition(point, rectangle, margin);
        if(isTopPosition) {
            if(isLeftPosition) {
                const extendedRectangle = rectangle.clone().inflate(margin);
                const extendedTopLeft = extendedRectangle.createPosition();
                const rectangleTopLeft = rectangle.createPosition();
                const topLeftDistance = Metrics.euclideanDistance(rectangleTopLeft, extendedTopLeft);
                const currentDistance = Metrics.euclideanDistance(rectangleTopLeft, point);
                return 1 - currentDistance / topLeftDistance;
            }
            if(isRightPosition) {
                const extendedRectangle = rectangle.clone().inflate(margin);
                const extendedTopRight = new Point(extendedRectangle.right, extendedRectangle.y);
                const rectangleTopRight = new Point(rectangle.right, rectangle.y);
                const topRightDistance = Metrics.euclideanDistance(rectangleTopRight, extendedTopRight);
                const currentDistance = Metrics.euclideanDistance(rectangleTopRight, point);
                return 1 - currentDistance / topRightDistance;
            }
            return 1 - (rectangle.y - point.y) / margin;
        }
        if(isBottomPosition) {
            if(isLeftPosition) {
                const extendedRectangle = rectangle.clone().inflate(margin);
                const extendedBottomLeft = new Point(extendedRectangle.x, extendedRectangle.bottom);
                const rectangleBottomLeft = new Point(rectangle.x, rectangle.bottom);
                const bottomLeftDistance = Metrics.euclideanDistance(rectangleBottomLeft, extendedBottomLeft);
                const currentDistance = Metrics.euclideanDistance(rectangleBottomLeft, point);
                return 1 - currentDistance / bottomLeftDistance;
            }
            if(isRightPosition) {
                const extendedRectangle = rectangle.clone().inflate(margin);
                const extendedBottomRight = new Point(extendedRectangle.right, extendedRectangle.bottom);
                const rectangleBottomRight = new Point(rectangle.right, rectangle.bottom);
                const bottomRightDistance = Metrics.euclideanDistance(rectangleBottomRight, extendedBottomRight);
                const currentDistance = Metrics.euclideanDistance(rectangleBottomRight, point);
                return 1 - currentDistance / bottomRightDistance;
            }
            return 1 - (point.y - rectangle.bottom) / margin;
        }
        if(isLeftPosition)
            return 1 - (rectangle.x - point.x) / margin;
        if(isRightPosition)
            return 1 - (point.x - rectangle.right) / margin;
        return 0;
    }
    private isTopPosition(point: Point, rectangle: Rectangle, margin: number): boolean {
        return point.x > rectangle.x - margin && point.x < rectangle.right + margin &&
            point.y > rectangle.y - margin && point.y < rectangle.y;
    }
    private isBottomPosition(point: Point, rectangle: Rectangle, margin: number): boolean {
        return point.x > rectangle.x - margin && point.x < rectangle.right + margin &&
            point.y > rectangle.bottom && point.y < rectangle.bottom + margin;
    }
    private isLeftPosition(point: Point, rectangle: Rectangle, margin: number): boolean {
        return point.x > rectangle.x - margin && point.x < rectangle.x &&
            point.y > rectangle.y - margin && point.y < rectangle.bottom + margin;
    }
    private isRightPosition(point: Point, rectangle: Rectangle, margin: number): boolean {
        return point.x > rectangle.right && point.x < rectangle.right + margin &&
            point.y > rectangle.y - margin && point.y < rectangle.bottom + margin;
    }
}

export class TurnDirectionMetrics {
    constructor(readonly description: ConnectorRoutingPenaltyDescription) { }
    penalty(oldValue: number, turnDirection: RightAngleTurnDirection) : number {
        switch(turnDirection) {
            case RightAngleTurnDirection.Backwards: return oldValue * this.description.turnBack;
            case RightAngleTurnDirection.Left: return oldValue * this.description.turnLeft;
            case RightAngleTurnDirection.Right: return oldValue * this.description.turnRight;
        }
        return oldValue;
    }
}

export class IntersectedShapesMetrics {
    constructor(readonly shapeMetrics: IntersectedShapeMetrics) { }

    penalty(oldValue: number, distance: number, position: Point, intersectedItems: DiagramItem[]) : number {
        if(!intersectedItems || !intersectedItems.length)
            return oldValue;
        let result = oldValue;
        intersectedItems.forEach(item => result = this.shapeMetrics.penalty(result, distance, position, item));
        return result;
    }
}

export class AStarMetrics implements IAStarMetrics<Point, RightAngleTurnDirection> {
    constructor(
        readonly turnDirectionMetrics : TurnDirectionMetrics,
        readonly shapesMetrics: IntersectedShapesMetrics) { }

    distance(point1: Point, point2: Point): number {
        return Metrics.manhattanDistance(point1, point2);
    }
    penalty(distance: number, position: Point, turnDirection: RightAngleTurnDirection, intersectedItems: DiagramItem[]): number {
        let result = distance;
        result = this.shapesMetrics.penalty(result, distance, position, intersectedItems);
        result = this.turnDirectionMetrics.penalty(result, turnDirection);
        return result;
    }
}

export enum IntersectedShapeZone {
    None = 0,
    Shape = 1,
    Margin = 2,
}
