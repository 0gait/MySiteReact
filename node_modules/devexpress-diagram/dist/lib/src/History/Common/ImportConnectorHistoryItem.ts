import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Connector } from "../../Model/Connectors/Connector";
import { ItemKey } from "../../Model/DiagramItem";

export class ImportConnectorHistoryItem extends HistoryItem {
    private connector: Connector;
    connectorKey: ItemKey;

    constructor(connector: Connector) {
        super();
        this.connector = connector;
    }
    redo(manipulator: ModelManipulator) {
        this.connectorKey = this.connector.key;
        manipulator.insertConnector(this.connector);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.removeConnector(connector);
    }
}
