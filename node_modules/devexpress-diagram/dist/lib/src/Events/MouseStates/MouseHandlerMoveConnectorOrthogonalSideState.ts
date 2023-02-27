import { Point } from "@devexpress/utils/lib/geometry/point";

import { History } from "../../History/History";
import { Connector } from "../../Model/Connectors/Connector";
import { ConnectorRenderPoint } from "../../Model/Connectors/ConnectorRenderPoint";
import { ConnectionPointSide, DiagramItem, ItemKey } from "../../Model/DiagramItem";
import { DiagramModel } from "../../Model/Model";
import { ModelUtils } from "../../Model/ModelUtils";
import { DiagramMouseEvent } from "../Event";
import { MouseHandler } from "../MouseHandler";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";

export class MouseHandlerMoveConnectorOrthogonalSideState extends MouseHandlerDraggingState {
    startPoint: Point;
    connector: Connector;

    pointCreated: boolean;
    isVerticalOrientation: boolean;
    renderPoint1: ConnectorRenderPoint;
    renderPoint2: ConnectorRenderPoint;
    pointIndex1: number;
    pointIndex2: number;
    point1: Point;
    point2: Point;

    constructor(handler: MouseHandler, history: History, protected model: DiagramModel) {
        super(handler, history);
    }

    onMouseDown(evt: DiagramMouseEvent): void {
        this.startPoint = evt.modelPoint;

        this.connector = this.model.findConnector(evt.source.key);
        this.handler.addInteractingItem(this.connector);
        const renderPointIndexes = evt.source.value.split("_");
        const renderPointIndex1 = parseInt(renderPointIndexes[0]);
        const renderPointIndex2 = parseInt(renderPointIndexes[1]);
        const points = this.connector.getRenderPoints(true);
        this.renderPoint1 = points[renderPointIndex1].clone();
        this.renderPoint2 = points[renderPointIndex2].clone();
        this.isVerticalOrientation = this.renderPoint1.x === this.renderPoint2.x;

        if(this.renderPoint1.pointIndex !== -1) {
            this.pointIndex1 = this.renderPoint1.pointIndex;
            if(this.pointIndex1 === 0) {
                this.pointIndex1++;
                this.correctEdgePoint(this.renderPoint1, this.renderPoint2,
                    this.connector.beginItem, this.connector.beginConnectionPointIndex);
            }
            else
                this.point1 = this.connector.points[this.pointIndex1].clone();
        }
        else
            this.pointIndex1 = this.findPointIndex(points, renderPointIndex1, false) + 1;

        if(this.renderPoint2.pointIndex !== -1) {
            this.pointIndex2 = this.renderPoint2.pointIndex;
            if(this.pointIndex2 === this.connector.points.length - 1)
                this.correctEdgePoint(this.renderPoint2, this.renderPoint1,
                    this.connector.endItem, this.connector.endConnectionPointIndex);

            else
                this.point2 = this.connector.points[this.pointIndex2].clone();
        }
        else
            this.pointIndex2 = this.findPointIndex(points, renderPointIndex2, true);

        super.onMouseDown(evt);
    }
    onApplyChanges(evt: DiagramMouseEvent): void {
        if(!this.pointCreated) {
            let createdPoint1: Point;
            let createdPoint2: Point;
            if(this.point1 === undefined) {
                this.point1 = new Point(this.renderPoint1.x, this.renderPoint1.y);
                ModelUtils.addConnectorPoint(this.history, this.connector.key, this.pointIndex1, this.point1.clone());
                createdPoint1 = this.point1.clone();
                this.pointIndex2++;
            }
            if(this.point2 === undefined) {
                this.point2 = new Point(this.renderPoint2.x, this.renderPoint2.y);
                ModelUtils.addConnectorPoint(this.history, this.connector.key, this.pointIndex2, this.point2.clone());
                createdPoint2 = this.point2.clone();
            }

            const excludePoints = [];
            if(createdPoint1)
                excludePoints.push(createdPoint1);
            if(createdPoint2)
                excludePoints.push(createdPoint2);

            const unnecessaryPoints = this.createUnnecessaryPoints(this.connector, excludePoints);

            Object.keys(unnecessaryPoints).forEach(key => {
                const pointIndex = parseInt(key);
                if(pointIndex < this.pointIndex1)
                    this.pointIndex1--;
                if(pointIndex < this.pointIndex2)
                    this.pointIndex2--;
            });
            this.pointCreated = true;
        }

        const point = this.getSnappedPoint(evt, evt.modelPoint);
        if(this.isVerticalOrientation) {
            this.point1.x = point.x;
            this.point2.x = point.x;
        }
        else {
            this.point1.y = point.y;
            this.point2.y = point.y;
        }

        ModelUtils.moveConnectorRightAnglePoints(
            this.history,
            this.connector,
            this.point1.clone(), this.pointIndex1,
            this.point2.clone(), this.pointIndex2);

        this.handler.tryUpdateModelSize();
    }

    private createUnnecessaryPoints(connector: Connector, excludePoints: Point[]) : {[key: number] : Point} {
        const oldRenderPoints = connector.getRenderPoints(true).map(p => p.clone());
        const unnecessaryRenderPoints = ModelUtils.createUnnecessaryRenderPoints(
            oldRenderPoints.filter(p => !p.skipped).map(p => p.clone()),
            connector.skippedRenderPoints,
            removedPoint => ModelUtils.findFirstPointIndex(oldRenderPoints, p => p.equals(removedPoint)),
            p => !excludePoints.some(ep => ep.equals(p)));
        const result = {};
        if(Object.keys(unnecessaryRenderPoints).length) {
            const points = connector.points.map(p => p.clone());
            const lastPointIndex = points.length - 1;
            points.forEach((p, index) => {
                if(index !== 0 && index !== lastPointIndex && !ModelUtils.isNecessaryPoint(p, index, unnecessaryRenderPoints))
                    result[index] = p;
            });
        }
        return result;
    }

    onFinishWithChanges(): void {
        ModelUtils.deleteConnectorUnnecessaryPoints(this.history, this.connector);
        ModelUtils.fixConnectorBeginEndConnectionIndex(this.history, this.connector);
        this.handler.tryUpdateModelSize();
    }
    findPointIndex(points: ConnectorRenderPoint[], index: number, direction: boolean) {
        let point: ConnectorRenderPoint;
        while(point = points[index]) {
            if(point.pointIndex !== -1)
                return point.pointIndex;
            index += direction ? 1 : -1;
        }
    }
    correctEdgePoint(point: Point, directionPoint: Point, item: DiagramItem, connectionPointIndex: number): void {
        let offset = 0;
        if(item) {
            const side = item.getConnectionPointSideByIndex(connectionPointIndex);
            const rect = item.rectangle;
            offset = Connector.minOffset;
            switch(side) {
                case ConnectionPointSide.South:
                    offset += rect.bottom - point.y;
                    break;
                case ConnectionPointSide.North:
                    offset += point.y - rect.y;
                    break;
                case ConnectionPointSide.East:
                    offset += rect.right - point.x;
                    break;
                case ConnectionPointSide.West:
                    offset += point.x - rect.x;
                    break;
            }
        }
        if(this.isVerticalOrientation)
            if(point.y > directionPoint.y)
                point.y -= Math.min(offset, point.y - directionPoint.y);
            else
                point.y += Math.min(offset, directionPoint.y - point.y);

        else
        if(point.x > directionPoint.x)
            point.x -= Math.min(offset, point.x - directionPoint.x);
        else
            point.x += Math.min(offset, directionPoint.x - point.x);

    }

    getDraggingElementKeys(): ItemKey[] {
        return [this.connector.key];
    }
}
