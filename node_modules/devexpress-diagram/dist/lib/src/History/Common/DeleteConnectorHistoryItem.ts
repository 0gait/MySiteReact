import { Connector } from "../../Model/Connectors/Connector";
import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";

export class DeleteConnectorHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    private connector: Connector;

    constructor(connectorKey: ItemKey) {
        super();
        this.connectorKey = connectorKey;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.connector = connector.clone();
        manipulator.deleteConnector(connector);
    }
    undo(manipulator: ModelManipulator) {
        manipulator.addConnector(this.connector, this.connector.key);
    }
}
