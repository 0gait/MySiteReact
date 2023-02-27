import { HistoryItem } from "../HistoryItem";
import { Connector, ConnectorPosition } from "../../Model/Connectors/Connector";
import { DiagramItem, ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";

export class AddConnectionHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    itemKey: ItemKey;
    connectionPointIndex: number;
    position: ConnectorPosition;

    constructor(connector: Connector, item: DiagramItem, connectionPointIndex: number, position: ConnectorPosition) {
        super();
        this.connectorKey = connector.key;
        this.itemKey = item.key;
        this.connectionPointIndex = connectionPointIndex;
        this.position = position;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.addConnection(connector, item, this.connectionPointIndex, this.position);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.deleteConnection(connector, this.position);
    }
}

export class SetConnectionPointIndexHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    connectionPointIndex: number;
    oldConnectionPointIndex: number;
    position: ConnectorPosition;
    constructor(connector: Connector, connectionPointIndex: number, position: ConnectorPosition) {
        super();
        this.connectorKey = connector.key;
        this.connectionPointIndex = connectionPointIndex;
        this.position = position;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldConnectionPointIndex = this.position === ConnectorPosition.Begin ? connector.beginConnectionPointIndex : connector.endConnectionPointIndex;
        manipulator.setConnectionPointIndex(connector, this.connectionPointIndex, this.position);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.setConnectionPointIndex(connector, this.oldConnectionPointIndex, this.position);
    }
}
