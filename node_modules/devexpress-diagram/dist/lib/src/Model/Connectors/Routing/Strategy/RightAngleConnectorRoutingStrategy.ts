import { Point } from "@devexpress/utils/lib/geometry/point";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { DiagramItem } from "../../../DiagramItem";
import { ConnectorRenderPoint } from "../../ConnectorRenderPoint";
import { IConnectorRoutingModel, IConnectorRoutingStrategy } from "../ConnectorRoutingModel";
import { ConnectorRenderSegment } from "../ConnectorRenderSegment";
import { IConnectorRoutingContext, RightAngleConnectorRoutingContext } from "./RightAngleConnectorRoutingContext";
import { ModelUtils } from "../../../ModelUtils";

export class RightAngleConnectorRoutingStrategy implements IConnectorRoutingStrategy {
    constructor(private readonly model: IConnectorRoutingModel) { }

    createRenderPoints(points: Point[], supportRenderPoints: ConnectorRenderPoint[],
        beginConnectionShape: DiagramItem, endConnectionShape: DiagramItem,
        beginConnectionPointIndex: number,
        endConnectionPointIndex: number,
        container: DiagramItem): ConnectorRenderPoint[] {
        if(supportRenderPoints.length > 1) {
            const context = new RightAngleConnectorRoutingContext(
                this.model, points, supportRenderPoints,
                beginConnectionShape, endConnectionShape,
                beginConnectionPointIndex, endConnectionPointIndex);
            context.initialize(container);
            if(context.shouldCreateRenderPoints)
                return this.createRenderPointsCore(context);
        }
    }

    clone(): IConnectorRoutingStrategy {
        return new RightAngleConnectorRoutingStrategy(this.model);
    }
    onAddPoint(points: Point[], pointIndex: number, point: Point, oldRenderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[] {
        const renderPoints = oldRenderPoints.map(p => new ConnectorRenderPoint(p.x, p.y, p.pointIndex));
        const renderPointIndex = ModelUtils.findFirstPointIndex(renderPoints, p => p.equals(point));
        if(renderPointIndex === 0) {
            renderPoints.splice(1, 0, new ConnectorRenderPoint(point.x, point.y, pointIndex));
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, 2);
        }
        const lastRenderPointIndex = renderPoints.length - 1;
        if(renderPointIndex === lastRenderPointIndex) {
            renderPoints.splice(lastRenderPointIndex, 0, new ConnectorRenderPoint(point.x, point.y, pointIndex));
            renderPoints[lastRenderPointIndex + 1].pointIndex = pointIndex + 1;
            return renderPoints;
        }
        if(renderPointIndex > 0) {
            const oldRenderPoint = renderPoints[renderPointIndex];
            renderPoints[renderPointIndex] = new ConnectorRenderPoint(oldRenderPoint.x, oldRenderPoint.y, pointIndex, oldRenderPoint.skipped);
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, renderPointIndex + 1);
        }
        const firstSegment = new Segment(renderPoints[0], renderPoints[1]);
        const newRenderPoint = new ConnectorRenderPoint(point.x, point.y);
        if(firstSegment.containsPoint(newRenderPoint)) {
            renderPoints.splice(1, 0, new ConnectorRenderPoint(newRenderPoint.x, newRenderPoint.y, -1));
            renderPoints.splice(2, 0, new ConnectorRenderPoint(newRenderPoint.x, newRenderPoint.y, pointIndex));
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, 3);
        }
        const lastSegment = new Segment(renderPoints[lastRenderPointIndex - 1], renderPoints[lastRenderPointIndex]);
        if(lastSegment.containsPoint(newRenderPoint)) {
            renderPoints.splice(lastRenderPointIndex, 0, new ConnectorRenderPoint(newRenderPoint.x, newRenderPoint.y, pointIndex));
            renderPoints.splice(lastRenderPointIndex + 1, 0, new ConnectorRenderPoint(newRenderPoint.x, newRenderPoint.y, -1));
            renderPoints[lastRenderPointIndex + 2].pointIndex = pointIndex + 1;
            return renderPoints;
        }
        return oldRenderPoints;
    }
    onDeletePoint(points: Point[], pointIndex: number, oldRenderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[] {
        const renderPoints = oldRenderPoints.map(p => new ConnectorRenderPoint(p.x, p.y, p.pointIndex));
        const renderPointIndex = this.getRenderPointIndexByPointIndex(renderPoints, pointIndex);
        if(renderPointIndex === 1) {
            const previuosRenderPoint = renderPoints[0];
            const currentRenderPoint = renderPoints[1];
            if(previuosRenderPoint.equals(currentRenderPoint)) {
                renderPoints.splice(1, 1);
                return ModelUtils.validateRenderPointIndexes(points, renderPoints, 1);
            }
            renderPoints[1] = new ConnectorRenderPoint(currentRenderPoint.x, currentRenderPoint.y, -1, currentRenderPoint.skipped);
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, 2);
        }
        if(renderPointIndex === 2) {
            const previuosRenderPoint = renderPoints[1];
            const currentRenderPoint = renderPoints[2];
            if(previuosRenderPoint.equals(currentRenderPoint)) {
                renderPoints.splice(1, 2);
                return ModelUtils.validateRenderPointIndexes(points, renderPoints, 1);
            }
            renderPoints[2] = new ConnectorRenderPoint(currentRenderPoint.x, currentRenderPoint.y, -1, currentRenderPoint.skipped);
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, 3);
        }
        const lastRenderPointIndex = renderPoints.length - 1;
        if(renderPointIndex === lastRenderPointIndex - 1) {
            const currentRenderPoint = renderPoints[lastRenderPointIndex - 1];
            const nextRenderPoint = renderPoints[lastRenderPointIndex];
            if(currentRenderPoint.equals(nextRenderPoint)) {
                renderPoints.splice(lastRenderPointIndex - 1, 1);
                return ModelUtils.validateRenderPointIndexes(points, renderPoints, lastRenderPointIndex - 1);
            }
            renderPoints[lastRenderPointIndex - 1] = new ConnectorRenderPoint(currentRenderPoint.x, currentRenderPoint.y, -1, currentRenderPoint.skipped);
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, lastRenderPointIndex);
        }
        if(renderPointIndex === lastRenderPointIndex - 2) {
            const currentRenderPoint = renderPoints[lastRenderPointIndex - 2];
            const nextRenderPoint = renderPoints[lastRenderPointIndex - 1];
            if(currentRenderPoint.equals(nextRenderPoint)) {
                renderPoints.splice(lastRenderPointIndex - 2, 2);
                return ModelUtils.validateRenderPointIndexes(points, renderPoints, lastRenderPointIndex - 2);
            }
            renderPoints[lastRenderPointIndex - 2] = new ConnectorRenderPoint(currentRenderPoint.x, currentRenderPoint.y, -1, currentRenderPoint.skipped);
            return ModelUtils.validateRenderPointIndexes(points, renderPoints, lastRenderPointIndex - 1);
        }
        const currentRenderPoint = renderPoints[renderPointIndex];
        renderPoints[renderPointIndex] = new ConnectorRenderPoint(currentRenderPoint.x, currentRenderPoint.y, -1, currentRenderPoint.skipped);
        return ModelUtils.validateRenderPointIndexes(points, renderPoints, renderPointIndex + 1);
    }
    onMovePoint(points: Point[], pointIndex: number, point: Point, oldRenderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[] {
        if(pointIndex === 0 || pointIndex === points.length - 1)
            return oldRenderPoints;
        const renderPoints = oldRenderPoints.map(p => new ConnectorRenderPoint(p.x, p.y, p.pointIndex));
        this.onMovePointCore(renderPoints, pointIndex, point);
        ModelUtils.skipUnnecessaryRightAngleRenderPoints(renderPoints);
        return renderPoints;
    }
    onMovePoints(points: Point[], beginPointIndex: number, beginPoint: Point, lastPointIndex: number, lastPoint: Point, oldRenderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[] {
        if(beginPointIndex === 0 || lastPointIndex === points.length - 1)
            return oldRenderPoints;
        const renderPoints = oldRenderPoints.map(p => new ConnectorRenderPoint(p.x, p.y, p.pointIndex));
        this.onMovePointCore(renderPoints, beginPointIndex, beginPoint);
        this.onMovePointCore(renderPoints, lastPointIndex, lastPoint);
        ModelUtils.skipUnnecessaryRightAngleRenderPoints(renderPoints);
        return renderPoints;
    }
    private onMovePointCore(newRenderPoints: ConnectorRenderPoint[], pointIndex: number, newPoint: Point) : void {
        const renderPointIndex = this.getRenderPointIndexByPointIndex(newRenderPoints, pointIndex);
        if(renderPointIndex >= 0) {
            const oldRenderPoint = newRenderPoints[renderPointIndex];
            newRenderPoints[renderPointIndex] = new ConnectorRenderPoint(newPoint.x, newPoint.y, pointIndex, oldRenderPoint.skipped);
        }
    }

    createRenderPointsCore(context: IConnectorRoutingContext<Point>): ConnectorRenderPoint[] {
        const result : ConnectorRenderPoint[] = [];
        let currentIndex = -1;
        let currentRenderSegment: ConnectorRenderSegment<Point>;
        let currentStartCustomPointIndex = -1;
        context.setup();
        const renderSegments = context.renderSegments;
        const endPoint = renderSegments[renderSegments.length - 1].endPoint;
        const points = context.points;
        do {
            this.registerCustomPoints(result, points, currentStartCustomPointIndex + 2, renderSegments[currentIndex + 1].startPointIndex - 1);
            currentIndex++;
            currentRenderSegment = renderSegments[currentIndex];
            currentStartCustomPointIndex = currentRenderSegment.startPointIndex;
            this.registerRenderPoints(
                result,
                context.createRoutedPoints(currentRenderSegment.startInfo, currentRenderSegment.endInfo, currentRenderSegment.createProhibitedSegments()),
                currentStartCustomPointIndex);
        } while(!currentRenderSegment.endPoint.equals(endPoint));
        context.validateRenderPoints(result);
        return result;
    }

    private getRenderPointIndexByPointIndex(points: ConnectorRenderPoint[], index: number): number {
        return ModelUtils.findFirstPointIndex(points, p => p.pointIndex === index);
    }
    private registerRenderPoints(resultPath : ConnectorRenderPoint[], routedPoints: Point[], beginPointIndex: number): void {
        routedPoints.forEach((p, i) => {
            const pointIndex = i === 0 ? beginPointIndex : (i === routedPoints.length - 1 ? beginPointIndex + 1 : -1);
            this.registerPoint(resultPath, p, pointIndex);
        });
    }
    private registerCustomPoints(resultPath : ConnectorRenderPoint[], points: Point[], startIndex: number, endIndex: number): void {
        for(let i = startIndex; i <= endIndex; i++)
            this.registerPoint(resultPath, points[i], i);
    }
    private registerPoint(resultPath : ConnectorRenderPoint[], point: Point, pointIndex: number): void {
        resultPath.push(new ConnectorRenderPoint(point.x, point.y, pointIndex));
    }
}
