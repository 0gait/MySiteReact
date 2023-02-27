import { Connector, ConnectorPosition } from "../../Model/Connectors/Connector";
import { DiagramMouseEvent, MouseEventElementType } from "../Event";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";
import { DeleteConnectionHistoryItem } from "../../History/Common/DeleteConnectionHistoryItem";
import { AddConnectionHistoryItem } from "../../History/Common/AddConnectionHistoryItem";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { DiagramModel } from "../../Model/Model";
import { ItemKey, DiagramItem } from "../../Model/DiagramItem";
import { ModelUtils } from "../../Model/ModelUtils";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { ConnectionPointInfo } from "../Visualizers/ConnectionPointsVisualizer";
import { ConnectionTargetInfo } from "../Visualizers/ConnectionTargetVisualizer";

export abstract class MouseHandlerMoveConnectorPointStateBase extends MouseHandlerDraggingState {
    connector: Connector;
    pointIndex: number;
    pointPosition: ConnectorPosition;
    oppositePointPosition: ConnectorPosition;
    oppositeItem: DiagramItem;
    oppositeConnectionPointIndex: number;
    targetItem: DiagramItem;

    constructor(handler: MouseHandler, history: History,
        protected model: DiagramModel,
        protected visualizerManager: IVisualizerManager) {
        super(handler, history);
    }

    finish(): void {
        this.visualizerManager.resetConnectionTarget();
        this.visualizerManager.resetConnectionPoints();
        super.finish();
    }

    onMouseDown(evt: DiagramMouseEvent): void {
        super.onMouseDown(evt);
        if(this.connector)
            this.handler.addInteractingItem(this.connector);
    }

    onMouseMove(evt: DiagramMouseEvent): void {
        super.onMouseMove(evt);
        if(!this.allowAttachToObjects(evt, false, false)) {
            this.visualizerManager.resetConnectionTarget();
            this.visualizerManager.resetConnectionPoints();
        }
        else if(this.connector) {
            let item = this.connector.getExtremeItem(this.pointPosition);
            this.visualizerManager.setConnectionTarget(item, evt.source.type);
            const pointIndex = this.connector.getExtremeConnectionPointIndex(this.pointPosition);
            if(!item && this.oppositeConnectionPointIndex !== -1 || !this.allowAttachToObjects(evt, true, false))
                item = this.model.findItem(evt.source.key);
            this.visualizerManager.setConnectionPoints(item, evt.source.type, pointIndex, true);
        }
    }

    onApplyChanges(evt: DiagramMouseEvent): void {
        let point = this.getSnappedPoint(evt, evt.modelPoint);
        if(this.pointPosition !== undefined) {
            if(this.oppositePointPosition === undefined) {
                this.oppositePointPosition = this.getOppositePointPosition();
                this.oppositeItem = this.connector.getExtremeItem(this.oppositePointPosition);
                this.oppositeConnectionPointIndex = this.connector.getExtremeConnectionPointIndex(this.oppositePointPosition);
            }
            this.targetItem = this.model.findItem(evt.source.key);
            const item = this.allowAttachToObjects(evt, true, true) ? this.targetItem : undefined;
            let connectionPointIndex = -1;
            if(evt.source.type === MouseEventElementType.ShapeConnectionPoint)
                connectionPointIndex = parseInt(evt.source.value);
            if(item && (evt.source.type === MouseEventElementType.Shape || evt.source.type === MouseEventElementType.ShapeConnectionPoint) &&
                (this.connector.getExtremeItem(this.oppositePointPosition) !== item ||
                (connectionPointIndex !== -1 && this.oppositeConnectionPointIndex !== -1 &&
                connectionPointIndex !== this.oppositeConnectionPointIndex))) {

                if(this.connector.getExtremeItem(this.pointPosition) !== item ||
                    this.connector.getExtremeConnectionPointIndex(this.pointPosition) !== connectionPointIndex) {
                    if(this.connector.getExtremeItem(this.pointPosition))
                        this.history.addAndRedo(new DeleteConnectionHistoryItem(this.connector, this.pointPosition));
                    this.history.addAndRedo(new AddConnectionHistoryItem(this.connector, item, connectionPointIndex, this.pointPosition));

                    if(this.oppositeItem)
                        this.updateOppositeItemConnectionPointIndex(connectionPointIndex);
                }
                point = item.getConnectionPointPosition(connectionPointIndex,
                    this.connector.points[this.pointIndex + (this.pointPosition === ConnectorPosition.End ? -1 : 1)]
                );
                this.visualizerManager.setConnectionPointIndex(connectionPointIndex);
            }
            else if(this.connector.getExtremeItem(this.pointPosition)) {
                this.history.addAndRedo(new DeleteConnectionHistoryItem(this.connector, this.pointPosition));
                if(this.oppositeItem)
                    this.updateOppositeItemConnectionPointIndex(this.oppositeConnectionPointIndex);
            }
        }
        ModelUtils.moveConnectorPoint(this.history, this.connector, this.pointIndex, point);
        ModelUtils.updateConnectorAttachedPoints(this.history, this.model, this.connector);
        this.handler.tryUpdateModelSize();
    }
    updateOppositeItemConnectionPointIndex(connectionPointIndex: number): void {
        const pointIndex = connectionPointIndex === -1 ? -1 : this.oppositeConnectionPointIndex;
        if(pointIndex !== this.connector.getExtremeConnectionPointIndex(this.oppositePointPosition)) {
            this.history.addAndRedo(new DeleteConnectionHistoryItem(this.connector, this.oppositePointPosition));
            this.history.addAndRedo(new AddConnectionHistoryItem(this.connector, this.oppositeItem,
                pointIndex, this.oppositePointPosition));
        }
    }
    onFinishWithChanges(): void {
        ModelUtils.updateConnectorContainer(this.history, this.model, this.connector);
        ModelUtils.deleteConnectorUnnecessaryPoints(this.history, this.connector);
        this.handler.tryUpdateModelSize();
    }

    getDraggingElementKeys(): ItemKey[] {
        return this.connector ? [this.connector.key] : [];
    }
    private getOppositePointPosition() {
        return this.pointPosition === ConnectorPosition.Begin ? ConnectorPosition.End : ConnectorPosition.Begin;
    }
    private allowAttachToObjects(evt: DiagramMouseEvent, checkContainers: boolean, checkOppositeItem: boolean) {
        if(this.handler.canMultipleSelection(evt))
            return false;
        const connector = this.connector;
        if(connector && evt.source.type === MouseEventElementType.Shape) {
            const targetItem = this.model.findItem(evt.source.key);
            if(checkContainers && this.model.findItemContainerCore(connector, c => c === targetItem))
                return false;
            if(checkContainers && this.oppositeItem && this.model.findItemContainerCore(this.oppositeItem, c => c === targetItem))
                return false;
            if(checkOppositeItem && this.oppositeItem === targetItem && this.oppositeConnectionPointIndex === -1)
                return false;
        }
        return true;
    }
    onConnectionPointsShow(key: string, points: ConnectionPointInfo[]): void {
        if(this.connector && this.pointPosition !== undefined && (this.connector.endItem && this.connector.endItem.key === key || this.connector.beginItem && this.connector.beginItem.key === key)) {
            const position = this.connector.beginItem && this.connector.beginItem.key === key ? ConnectorPosition.Begin : ConnectorPosition.End;
            points.forEach((point, index) => {
                point.allowed = this.handler.canPerformChangeConnectionOnUpdateUI(
                    this.connector,
                    { item: this.connector.getExtremeItem(position), position: position, connectionPointIndex: index }
                );
            });
        }
    }
    onConnectionTargetShow(key: string, info: ConnectionTargetInfo): void {
        if(this.connector && this.pointPosition !== undefined && (this.connector.endItem && this.connector.endItem.key === key || this.connector.beginItem && this.connector.beginItem.key === key)) {
            const position = this.connector.beginItem && this.connector.beginItem.key === key ? ConnectorPosition.Begin : ConnectorPosition.End;
            info.allowed = this.handler.canPerformChangeConnectionOnUpdateUI(
                this.connector,
                { item: this.connector.getExtremeItem(position), position: position, connectionPointIndex: -1 }
            );
        }
    }
}
