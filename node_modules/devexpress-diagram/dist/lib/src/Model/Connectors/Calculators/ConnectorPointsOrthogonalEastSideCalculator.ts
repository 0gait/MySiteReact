import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectionPointSide } from "../../DiagramItem";
import { ConnectorPointsOrthogonalCalculator } from "./ConnectorPointsOrthogonalCalculator";
import { ConnectorPointsOrthogonalSideCalculatorBase } from "./ConnectorPointsOrthogonalSideCalculatorBase";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";

export class ConnectorPointsOrthogonalEastSideCalculator extends ConnectorPointsOrthogonalSideCalculatorBase {
    constructor(parent: ConnectorPointsOrthogonalCalculator) {
        super(parent);
    }

    getCorrectOriginPoint(originPoint: ConnectorRenderPoint, originRect: Rectangle) {
        if(originPoint.x < originRect.right)
            originPoint = originPoint.clone().offset(originRect.right - originPoint.x, 0);
        return originPoint;
    }
    getSameShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.North:
            case ConnectionPointSide.South:
            case ConnectionPointSide.East:
                return [ originPoint.clone().offset(this.getMinOffset(), 0)];
            case ConnectionPointSide.West:
                return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                    this.getMinOffset(), this.getMinOffset());
        }
    }
    getOverlappedPointsOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.East:
                return [ originPoint.clone().offset(this.getMinOffset(), 0)];
            case ConnectionPointSide.West:
                return [ originPoint.clone().offset(-this.getMinOffset(), 0)];
        }
        return [];
    }
    getBeginOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.North:
                if(originPoint.x < targetPoint.x)
                    if(originPoint.y < targetPoint.y)
                        return [];
                    else
                        return [ originPoint.clone().offset(this.getMinOffset(), 0)];

                if(originPoint.x > this.endRect.right)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), true);
                return [ originPoint.clone().offset(this.getMinOffset(), 0)];
            case ConnectionPointSide.South:
                if(originPoint.x < targetPoint.x)
                    if(originPoint.y > targetPoint.y)
                        return [];
                    else
                        return [ originPoint.clone().offset(this.getMinOffset(), 0)];

                if(originPoint.x > this.endRect.right)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), false);
                return [ originPoint.clone().offset(this.getMinOffset(), 0)];
            case ConnectionPointSide.East:
                return [ originPoint.clone().offset(this.getMinOffset(), 0)];
            case ConnectionPointSide.West:
                return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                    this.getMinOffset(), this.getMinOffset(), originPoint.y < targetPoint.y);
        }
    }
    getEndOverlappedShapeOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.East:
                return [ originPoint.clone().offset(this.getMinOffset(), 0)];
            case ConnectionPointSide.West: {
                let offset = this.getMinOffset();
                if(this.beginRect.right > originPoint.x)
                    offset += this.beginRect.right - originPoint.x;
                return [originPoint.clone().offset(offset, 0)];
            }
            case ConnectionPointSide.North:
                if(targetPoint.x < originPoint.x)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), true);
                if(originPoint.y > targetPoint.y)
                    return [ originPoint.clone().offset(this.getMinOffset(), 0)];
                return [];
            case ConnectionPointSide.South:
                if(targetPoint.x < originPoint.x)
                    return this.getAsideOffsetPoints(originPoint, targetPoint, originRect,
                        this.getMinOffset(), this.getMinOffset(), false);
                if(originPoint.y < targetPoint.y)
                    return [ originPoint.clone().offset(this.getMinOffset(), 0)];
                return [];
        }
    }
    getBeginOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        return [ originPoint.clone().offset(this.getScaleableOffsetX(originPoint, targetPoint, false), 0)];
    }
    getEndOnSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        return [ originPoint.clone().offset(this.getScaleableOffsetX(originPoint, targetPoint, true), 0)];
    }
    getBeginOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        switch(targetSide) {
            case ConnectionPointSide.South:
                if(this.isBeginEndOverlappedY())
                    return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false, false);
                break;
            case ConnectionPointSide.North:
                if(this.isBeginEndOverlappedY())
                    return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false, true);
                break;
            case ConnectionPointSide.East:
                if(this.isBeginEndOverlappedY())
                    return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false);
                break;
            case ConnectionPointSide.Undefined:
            case ConnectionPointSide.West:
                return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, false);
        }
        return [ originPoint.clone().offset(this.getScaleableOffsetX(originPoint, targetPoint, false), 0)];
    }
    getEndOffSideOffsetPoints(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle): ConnectorRenderPoint[] {
        if(targetSide === ConnectionPointSide.Undefined)
            return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, true);
        else if(this.isBeginEndOverlappedY()) {
            const direction = this.beginRect.center.y > this.endRect.center.y;
            return this.getScaleableAsideOffsetPoints(originPoint, targetPoint, originRect, true, direction);
        }
        return [ originPoint.clone().offset(this.getScaleableOffsetX(originPoint, targetPoint, true), 0)];
    }
    getAsideOffsetPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle,
        offset: number, asideOffset: number, direction?: boolean): ConnectorRenderPoint[] {
        const points = [ ];
        if(originRect !== undefined) {
            if(direction === undefined)
                direction = targetPoint.y < originPoint.y;
            if(direction)
                points.push(originPoint.clone().offset(offset, -(originPoint.y - originRect.y + asideOffset)));
            else
                points.push(originPoint.clone().offset(offset, (originRect.bottom - originPoint.y + asideOffset)));
        }
        points.push(originPoint.clone().offset(offset, 0));
        return points;
    }
    getScaleableAsideOffsetPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, originRect: Rectangle, isEnd?: boolean, direction?: boolean): ConnectorRenderPoint[] {
        const offset = this.getScaleableOffsetX(originPoint, targetPoint, isEnd);
        const asideOffset = this.getScaleableOffsetY(originPoint, targetPoint, isEnd);
        return this.getAsideOffsetPoints(originPoint, targetPoint, originRect, offset, asideOffset, direction);
    }
    getScaleableOffsetX(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, isEnd: boolean): number {
        if(this.beginRect && this.endRect) {
            const distance = isEnd ? this.beginRect.x - originPoint.x : this.endRect.x - originPoint.x;
            if(distance > 0 && distance < this.getMinOffset() * 2)
                return distance / 2;
        }
        return this.getMinOffset();
    }
    getScaleableOffsetY(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint, isEnd: boolean): number {
        if(this.beginRect && this.endRect)
            if(!isEnd && !this.isBeginEndOverlappedY()) {
                let distance;
                if(targetPoint.y < originPoint.y)
                    distance = this.beginRect.y - this.endRect.bottom;
                else
                    distance = this.endRect.y - this.beginRect.bottom;
                if(distance < this.getMinOffset() * 2)
                    return distance / 2;
            }

        return this.getMinOffset();
    }
    isOnSidePoint(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean {
        return targetPoint.x > originPoint.x;
    }

    isDirectConnectionAllowed(targetSide: ConnectionPointSide, originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): boolean {
        return targetSide === ConnectionPointSide.West || targetSide === ConnectionPointSide.Undefined;
    }
    getDirectConnectionPoints(originPoint: ConnectorRenderPoint, targetPoint: ConnectorRenderPoint): ConnectorRenderPoint[] {
        const cx = originPoint.x + (targetPoint.x - originPoint.x) / 2;
        return [
            new ConnectorRenderPoint(cx, originPoint.y),
            new ConnectorRenderPoint(cx, targetPoint.y)
        ];
    }
}
