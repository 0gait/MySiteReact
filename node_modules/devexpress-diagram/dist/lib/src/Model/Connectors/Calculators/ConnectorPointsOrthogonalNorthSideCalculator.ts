import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectionPointSide } from "../../DiagramItem";
import { ConnectorPointsOrthogonalCalculator } from "./ConnectorPointsOrthogonalCalculator";
import { ConnectorPointsOrthogonalSideCalculatorBase } from "./ConnectorPointsOrthogonalSideCalculatorBase";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";

export class ConnectorPointsOrthogonalNorthSideCalculator extends ConnectorPointsOrthogonalSideCalculatorBase {
    constructor(parent: ConnectorPointsOrthogonalCalculator) {
        super(parent);
    }

    getCorrectOriginPoint(originPoint: ConnectorRenderPoint, originRect: Rectangle) {
        if(originPoint.y > originRect.y)
            originPoint = originPoint.clone().offset(0, originRect.y - originPoint.y);
        return originPoint;
    }
    getSameShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.East:
            case ConnectionPointSide.West:
            case ConnectionPointSide.North:
                return [ originPoint.clone().offset(0, -this.getMinOffset())];
            case ConnectionPointSide.South:
                return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                    this.getMinOffset(), this.getMinOffset());
        }
    }
    getOverlappedPointsOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.South:
                return [ originPoint.clone().offset(0, this.getMinOffset())];
            case ConnectionPointSide.North:
                return [ originPoint.clone().offset(0, -this.getMinOffset())];
        }
        return [];
    }
    getBeginOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.East:
                if(originPoint.y > targetPoint.y)
                    if(originPoint.x > targetPoint.x)
                        return [];
                    else
                        return [ originPoint.clone().offset(0, -this.getMinOffset())];

                if(originPoint.y < this.endRect.y)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), false);
                return [ originPoint.clone().offset(0, -this.getMinOffset())];
            case ConnectionPointSide.West:
                if(originPoint.y > targetPoint.y)
                    if(originPoint.x < targetPoint.x)
                        return [];
                    else
                        return [ originPoint.clone().offset(0, -this.getMinOffset())];

                if(originPoint.y < this.endRect.y)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), true);
                return [ originPoint.clone().offset(0, -this.getMinOffset())];
            case ConnectionPointSide.North:
                return [ originPoint.clone().offset(0, -this.getMinOffset())];
            case ConnectionPointSide.South:
                return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                    this.getMinOffset(), this.getMinOffset(), originPoint.x < targetPoint.x);
        }
    }
    getEndOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.East:
                if(targetPoint.y > originPoint.y)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), false);
                if(originPoint.x < targetPoint.x)
                    return [ originPoint.clone().offset(0, -this.getMinOffset())];
                return [];
            case ConnectionPointSide.West:
                if(targetPoint.y > originPoint.y)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), true);
                if(originPoint.x > targetPoint.x)
                    return [ originPoint.clone().offset(0, -this.getMinOffset())];
                return [];
            case ConnectionPointSide.North:
                return [ originPoint.clone().offset(0, -this.getMinOffset())];
            case ConnectionPointSide.South: {
                let offset = -this.getMinOffset();
                if(this.beginRect.y < originPoint.y)
                    offset -= originPoint.y - this.beginRect.y;
                return [originPoint.clone().offset(0, offset)];
            }
        }
    }
    getBeginOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        return [ originPoint.clone().offset(0, -this.getScaleableOffsetY(originPoint, targetPoint, false))];
    }
    getEndOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        return [ originPoint.clone().offset(0, -this.getScaleableOffsetY(originPoint, targetPoint, true))];
    }
    getBeginOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.East:
                if(this.isBeginEndOverlappedX())
                    return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false, false);
                break;
            case ConnectionPointSide.West:
                if(this.isBeginEndOverlappedX())
                    return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false, true);
                break;
            case ConnectionPointSide.North:
                if(this.isBeginEndOverlappedX())
                    return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false);
                break;
            case ConnectionPointSide.Undefined:
            case ConnectionPointSide.South:
                return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false);
        }
        return [ originPoint.clone().offset(0, -this.getScaleableOffsetY(originPoint, targetPoint, false))];
    }
    getEndOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        if(targetSide === ConnectionPointSide.Undefined)
            return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, true);
        else if(this.isBeginEndOverlappedX()) {
            const direction = this.beginRect.center.x > this.endRect.center.x;
            return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, true, direction);
        }
        return [ originPoint.clone().offset(0, -this.getScaleableOffsetY(originPoint, targetPoint, true))];
    }
    getAsideOffsetPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle,
        offset: number, asideOffset: number, direction?: boolean): ConnectorRenderPoint[] {
        const points = [ ];
        if(originRect !== undefined) {
            if(direction === undefined)
                direction = targetPoint.x < originPoint.x;
            if(direction)
                points.push(originPoint.clone().offset(-(originPoint.x - originRect.x + asideOffset), -offset));
            else
                points.push(originPoint.clone().offset((originRect.right - originPoint.x + asideOffset), -offset));
        }
        points.push(originPoint.clone().offset(0, -offset));
        return points;
    }
    getScaleableAsideOffsetPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle, isEnd?: boolean, direction?: boolean): ConnectorRenderPoint[] {
        const offset = this.getScaleableOffsetY(originPoint, targetPoint, isEnd);
        const asideOffset = this.getScaleableOffsetX(originPoint, targetPoint, isEnd);
        return this.getAsideOffsetPoints(originPoint, targetPoint, originRect, offset, asideOffset, direction);
    }
    getScaleableOffsetX(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, isEnd: boolean): number {
        if(this.beginRect && this.endRect)
            if(!isEnd && !this.isBeginEndOverlappedX()) {
                let distance;
                if(targetPoint.x < originPoint.x)
                    distance = this.beginRect.x - this.endRect.right;
                else
                    distance = this.endRect.x - this.beginRect.right;
                if(distance < this.getMinOffset() * 2)
                    return distance / 2;
            }

        return this.getMinOffset();
    }
    getScaleableOffsetY(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, isEnd: boolean): number {
        if(this.beginRect && this.endRect) {
            const distance = isEnd ? originPoint.y - this.beginRect.bottom : originPoint.y - this.endRect.bottom;
            if(distance > 0 && distance < this.getMinOffset() * 2)
                return distance / 2;
        }
        return this.getMinOffset();
    }
    isOnSidePoint(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean {
        return targetPoint.y < originPoint.y;
    }

    isDirectConnectionAllowed(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean {
        return targetSide === ConnectionPointSide.South || targetSide === ConnectionPointSide.Undefined;
    }
    getDirectConnectionPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): ConnectorRenderPoint[] {
        const cy = targetPoint.y + (originPoint.y - targetPoint.y) / 2;
        return [
            new ConnectorRenderPoint(originPoint.x, cy),
            new ConnectorRenderPoint(targetPoint.x, cy)
        ];
    }
}
