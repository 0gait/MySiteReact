import { ConnectorPosition, Connector } from "../../Model/Connectors/Connector";
import { DiagramMouseEvent } from "../Event";
import { AddConnectionHistoryItem } from "../../History/Common/AddConnectionHistoryItem";
import { AddConnectorHistoryItem } from "../../History/Common/AddConnectorHistoryItem";
import { DiagramItem, ConnectionPointSide } from "../../Model/DiagramItem";
import { MouseHandlerMoveConnectorPointStateBase } from "./MouseHandlerMoveConnectorPointStateBase";
import { SetSelectionHistoryItem } from "../../History/Common/SetSelectionHistoryItem";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { Selection } from "../../Selection/Selection";
import { DiagramModel } from "../../Model/Model";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { AddShapeHistoryItem } from "../../History/Common/AddShapeHistoryItem";
import { ModelUtils } from "../../Model/ModelUtils";
import { Shape } from "../../Model/Shapes/Shape";
import { IShapeDescriptionManager } from "../../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { DeleteConnectionHistoryItem } from "../../History/Common/DeleteConnectionHistoryItem";
import { DeleteConnectorHistoryItem } from "../../History/Common/DeleteConnectorHistoryItem";

export class MouseHandlerCreateConnectorState extends MouseHandlerMoveConnectorPointStateBase {
    connectionPointIndex: number;
    connectedItem: DiagramItem;

    constructor(handler: MouseHandler, history: History, model: DiagramModel, visualizerManager: IVisualizerManager,
        protected shapeDescriptionManager: IShapeDescriptionManager,
        protected selection: Selection,
        connectionPointIndex?: number) {
        super(handler, history, model, visualizerManager);
        this.connectionPointIndex = connectionPointIndex;
    }

    onMouseDown(evt: DiagramMouseEvent) {
        if(this.connectionPointIndex === undefined)
            this.connectionPointIndex = parseInt(evt.source.value);
        this.connectedItem = this.model.findItem(evt.source.key);
        this.pointIndex = 1;
        this.pointPosition = ConnectorPosition.End;

        super.onMouseDown(evt);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(this.connector && !this.connector.endItem)
            this.createNewShapeAtConnectorEnd(evt);
        super.onMouseUp(evt);
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        const point = this.getSnappedPoint(evt, evt.modelPoint);
        if(!this.connector) {
            const historyItem = new AddConnectorHistoryItem([this.connectedItem.getConnectionPointPosition(this.connectionPointIndex, point), point]);
            this.history.addAndRedo(historyItem);
            this.connector = this.model.findConnector(historyItem.connectorKey);

            this.handler.addInteractingItem(this.connector);

            this.history.addAndRedo(
                new AddConnectionHistoryItem(this.connector, this.connectedItem, this.connectionPointIndex, ConnectorPosition.Begin)
            );
            ModelUtils.updateNewConnectorProperties(this.history, this.selection, this.connector.key);
        }
        else super.onApplyChanges(evt);
    }
    checkStoredPermissionsOnFinish() {
        if(this.connector && this.connector.endItem)
            super.checkStoredPermissionsOnFinish();
    }
    onFinishWithChanges() {
        super.onFinishWithChanges();

        this.history.addAndRedo(new SetSelectionHistoryItem(this.selection, [this.connector.key]));
    }

    private createNewShapeAtConnectorEnd(evt: DiagramMouseEvent) {
        const beginShape = this.connector && <Shape> this.connector.beginItem;
        if(!beginShape) return;

        if(this.connector && !this.handler.canPerformChangeConnection(this.connector,
            { position: ConnectorPosition.End, connectionPointIndex: -1 })) {
            this.cancelChanges();
            return;
        }

        const side = this.getNewShapeSide(this.connector);
        const point = this.getSnappedPoint(evt, evt.modelPoint);
        const category = this.shapeDescriptionManager.getCategoryByDescription(beginShape.description);
        const getPositionToInsertShapeTo = (shape: Shape): Point => {
            const clonedShape = shape.clone();
            clonedShape.position = point.clone();
            const position = this.getNewShapePosition(clonedShape, side);
            return this.handler.getSnappedPointOnDragPoint(evt, position);
        };
        this.handler.showContextToolbox(point, getPositionToInsertShapeTo, side, category, (shapeType: string) => {
            if(!shapeType)
                return;

            this.handler.beginStorePermissions();
            this.history.beginTransaction();
            const historyItem = new AddShapeHistoryItem(this.shapeDescriptionManager.get(shapeType), point);
            this.history.addAndRedo(historyItem);

            const shape = this.model.findShape(historyItem.shapeKey);
            const container = this.targetItem && this.model.findNearestContainer(this.targetItem.key);
            if(container)
                ModelUtils.insertToContainer(this.history, this.model, shape, container);


            const newPosition = this.getNewShapePosition(shape, side);
            ModelUtils.setShapePosition(this.history, this.model, shape, this.getSnappedPoint(evt, newPosition));
            ModelUtils.updateNewShapeProperties(this.history, this.selection, shape.key);

            this.history.addAndRedo(new AddConnectionHistoryItem(this.connector, shape,
                shape.getConnectionPointIndexForSide(side), ConnectorPosition.End));
            if(container)
                ModelUtils.updateConnectorContainer(this.history, this.model, this.connector);
            ModelUtils.updateShapeAttachedConnectors(this.history, this.model, shape);

            if(!this.handler.isStoredPermissionsGranted()) {
                this.handler.lockPermissions();
                this.history.undoTransaction();
                this.handler.unlockPermissions();

                this.checkNewConnectorPermissions();
            }
            else {
                this.handler.tryUpdateModelSize();
                this.history.addAndRedo(new SetSelectionHistoryItem(this.selection, [shape.key]));
            }
            this.history.endTransaction();
            this.handler.endStorePermissions();

            this.handler.hideContextToolbox(true);
        }, () => {
            this.checkNewConnectorPermissions();
        });
    }
    private checkNewConnectorPermissions() {
        if(this.connector && !this.handler.canPerformChangeConnection(this.connector,
            { position: ConnectorPosition.End, connectionPointIndex: -1 })) {
            this.handler.lockPermissions();
            this.history.beginTransaction();
            this.history.addAndRedo(new SetSelectionHistoryItem(this.selection, []));
            if(this.connector.beginItem)
                this.history.addAndRedo(new DeleteConnectionHistoryItem(this.connector, ConnectorPosition.Begin));
            if(this.connector.endItem)
                this.history.addAndRedo(new DeleteConnectionHistoryItem(this.connector, ConnectorPosition.End));
            this.history.addAndRedo(new DeleteConnectorHistoryItem(this.connector.key));
            this.history.endTransaction();
            this.handler.unlockPermissions();
        }
    }
    private getNewShapePosition(shape: Shape, side: ConnectionPointSide): Point {
        switch(side) {
            case ConnectionPointSide.North:
                return shape.position.clone().offset(-shape.size.width / 2, 0);
            case ConnectionPointSide.South:
                return shape.position.clone().offset(-shape.size.width / 2, -shape.size.height);
            case ConnectionPointSide.East:
                return shape.position.clone().offset(-shape.size.width, -shape.size.height / 2);
            case ConnectionPointSide.West:
                return shape.position.clone().offset(0, -shape.size.height / 2);
        }
    }
    private getNewShapeSide(connector: Connector): ConnectionPointSide {
        const renderPoints = connector.getRenderPoints();
        return MouseHandlerCreateConnectorState.getNewShapeSideByConnectorPoints(
            renderPoints[renderPoints.length - 1],
            renderPoints[renderPoints.length - 2]
        );
    }
    protected getSourceItem(): DiagramItem {
        return this.connectedItem;
    }
    static getNewShapeSideByConnectorPoints(point: Point, directionPoint: Point): ConnectionPointSide {
        if(point.x === directionPoint.x)
            if(point.y > directionPoint.y)
                return ConnectionPointSide.North;
            else
                return ConnectionPointSide.South;

        else if(point.x > directionPoint.x)
            if(point.y === directionPoint.y)
                return ConnectionPointSide.West;
            else if(point.y > directionPoint.y)
                if(Math.abs(point.x - directionPoint.x) > Math.abs(point.y - directionPoint.y))
                    return ConnectionPointSide.West;
                else
                    return ConnectionPointSide.North;

            else
            if(Math.abs(point.x - directionPoint.x) > Math.abs(point.y - directionPoint.y))
                return ConnectionPointSide.West;
            else
                return ConnectionPointSide.South;


        else
        if(point.y === directionPoint.y)
            return ConnectionPointSide.East;
        else if(point.y > directionPoint.y)
            if(Math.abs(point.x - directionPoint.x) > Math.abs(point.y - directionPoint.y))
                return ConnectionPointSide.East;
            else
                return ConnectionPointSide.North;

        else
        if(Math.abs(point.x - directionPoint.x) > Math.abs(point.y - directionPoint.y))
            return ConnectionPointSide.East;
        else
            return ConnectionPointSide.South;


    }
}
