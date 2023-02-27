import { Point } from "@devexpress/utils/lib/geometry/point";

import { ConnectorRenderPointsContext } from "../../Model/Connectors/Routing/ConnectorRenderPointsContext";
import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { HistoryItem } from "../HistoryItem";

export class MoveConnectorPointHistoryItem extends HistoryItem {
    private oldPoint: Point;
    private renderContext: ConnectorRenderPointsContext | undefined;
    constructor(
        private connectorKey: ItemKey,
        private pointIndex: number,
        private newPoint: Point) {
        super();
    }
    redo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldPoint = connector.points[this.pointIndex].clone();
        this.renderContext = connector.tryCreateRenderPointsContext();
        manipulator.moveConnectorPoint(
            connector,
            this.pointIndex,
            connector => {
                connector.movePoint(this.pointIndex, this.newPoint);
                connector.onMovePoint(this.pointIndex, this.newPoint);
            });
    }
    undo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.moveConnectorPoint(
            connector,
            this.pointIndex,
            connector => {
                connector.movePoint(this.pointIndex, this.oldPoint);
                connector.replaceRenderPoints(this.renderContext);
            });
    }
}

export class MoveConnectorRightAnglePointsHistoryItem extends HistoryItem {
    oldBeginPoint: Point;
    oldLastPoint: Point;
    renderContext: ConnectorRenderPointsContext | undefined;
    constructor(
        private connectorKey: ItemKey,
        private beginPointIndex: number,
        private newBeginPoint: Point,
        private lastPointIndex: number,
        private newLastPoint: Point) {
        super();
    }
    redo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldBeginPoint = connector.points[this.beginPointIndex].clone();
        this.oldLastPoint = connector.points[this.lastPointIndex].clone();
        this.renderContext = connector.tryCreateRenderPointsContext();
        manipulator.changeConnectorPoints(
            connector,
            connector => {
                connector.movePoint(this.beginPointIndex, this.newBeginPoint);
                connector.movePoint(this.lastPointIndex, this.newLastPoint);
                connector.onMovePoints(this.beginPointIndex, this.newBeginPoint, this.lastPointIndex, this.newLastPoint);
            });
    }
    undo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.changeConnectorPoints(
            connector,
            connector => {
                connector.movePoint(this.beginPointIndex, this.oldBeginPoint);
                connector.movePoint(this.lastPointIndex, this.oldLastPoint);
                connector.replaceRenderPoints(this.renderContext);
            });
    }
}
