import { HistoryItem } from "../HistoryItem";
import { Connector, ConnectorPosition } from "../../Model/Connectors/Connector";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";

export class DeleteConnectionHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    itemKey: ItemKey;
    position: ConnectorPosition;
    oldConnectionPointIndex: number;

    constructor(connector: Connector, position: ConnectorPosition) {
        super();
        this.connectorKey = connector.key;
        this.position = position;
        this.itemKey = connector.getExtremeItem(this.position).key;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldConnectionPointIndex = this.position === ConnectorPosition.Begin ? connector.beginConnectionPointIndex : connector.endConnectionPointIndex;
        manipulator.deleteConnection(connector, this.position);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        const item = manipulator.model.findItem(this.itemKey);
        manipulator.addConnection(connector, item, this.oldConnectionPointIndex, this.position);
    }
}
