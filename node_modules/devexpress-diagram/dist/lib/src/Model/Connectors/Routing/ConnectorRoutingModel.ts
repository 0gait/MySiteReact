import { Point } from "@devexpress/utils/lib/geometry/point";

import { ConnectorRoutingMode, IConnectorRoutingModeListener } from "../../../Settings";
import { DiagramItem } from "../../DiagramItem";
import { DiagramModel } from "../../Model";
import { Shape } from "../../Shapes/Shape";
import { Connector } from "../Connector";
import { ConnectorLineOption } from "../ConnectorProperties";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";
import { RightAngleConnectorRoutingStrategy } from "./Strategy/RightAngleConnectorRoutingStrategy";

export interface IConnectorRoutingStrategy {

    createRenderPoints(points: Point[], supportRenderPoints: ConnectorRenderPoint[],
        beginConnectionShape: DiagramItem, endConnectionShape: DiagramItem,
        beginConnectionPointIndex: number,
        endConnectionPointIndex: number,
        container: DiagramItem): ConnectorRenderPoint[];
    clone() : IConnectorRoutingStrategy;

    onAddPoint(points: Point[], pointIndex: number, point: Point, oldRenderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[];
    onDeletePoint(points: Point[], pointIndex: number, oldRenderPoints: ConnectorRenderPoint[]) : ConnectorRenderPoint[];
    onMovePoint(points: Point[], pointIndex: number, point: Point, oldRenderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[];
    onMovePoints(points: Point[], beginPointIndex: number, beginPoint: Point, lastPointIndex: number, lastPoint: Point, renderPoints: ConnectorRenderPoint[]): ConnectorRenderPoint[];
}
export interface IConnectorRoutingModel {
    shapeMargins: number;
    shouldReverseConnections: boolean;
    shouldResizeConnections: boolean;
    penaltyDescription: ConnectorRoutingPenaltyDescription;

    initialize(model: DiagramModel) : void;
    createStrategy(lineOption: ConnectorLineOption): IConnectorRoutingStrategy;
    getItems(beginShape: DiagramItem, endShape: DiagramItem): DiagramItem[];
}

export class ConnectorRoutingPenaltyDescription {
    shape: number = 20.0;
    margin: number = 2.0;
    turnBack: number = 20.0;
    turnLeft: number = 3.1;
    turnRight: number = 3.0;
}

export class ConnectorRoutingModel implements IConnectorRoutingModel, IConnectorRoutingModeListener {
    private model : DiagramModel;
    connectorRoutingMode : ConnectorRoutingMode = ConnectorRoutingMode.AllShapesOnly;
    shapeMargins: number = Connector.minOffset;
    shouldReverseConnections: boolean = true;
    shouldResizeConnections: boolean = true;
    penaltyDescription: ConnectorRoutingPenaltyDescription = new ConnectorRoutingPenaltyDescription();

    initialize(model : DiagramModel): void {
        this.model = model;
    }
    createStrategy(option : ConnectorLineOption) : IConnectorRoutingStrategy {
        if(this.model !== undefined && this.connectorRoutingMode !== ConnectorRoutingMode.None && option === ConnectorLineOption.Orthogonal)
            return new RightAngleConnectorRoutingStrategy(this);
        return undefined;
    }
    getItems(beginConnectorShape: DiagramItem, endConnectorShape: DiagramItem): DiagramItem[] {
        return this.getShapes(beginConnectorShape, endConnectorShape);
    }
    notifyConnectorRoutingModeChanged(connectorRoutingMode: ConnectorRoutingMode): void {
        this.connectorRoutingMode = connectorRoutingMode;
    }
    private getShapes(beginConnectorShape: DiagramItem, endConnectorShape: DiagramItem) : DiagramItem[] {
        if(this.model === undefined || this.connectorRoutingMode === undefined || this.connectorRoutingMode === ConnectorRoutingMode.None)
            return [];
        if(this.connectorRoutingMode === ConnectorRoutingMode.AllShapesOnly)
            return this.model.items.filter(i => i instanceof Shape);
        return this.getConnectorShapes(beginConnectorShape, endConnectorShape);
    }
    private getConnectorShapes(beginConnectorShape: DiagramItem, endConnectorShape: DiagramItem) : DiagramItem[] {
        const result = [];
        if(beginConnectorShape)
            result.push(beginConnectorShape);
        if(endConnectorShape && beginConnectorShape !== endConnectorShape)
            result.push(endConnectorShape);
        return result;
    }
}
