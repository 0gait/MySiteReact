import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Connector } from "../../Model/Connectors/Connector";
import { ItemKey } from "../../Model/DiagramItem";

export class ChangeConnectorTextPositionHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    position: number;
    newPosition: number;

    constructor(connector: Connector, position: number, newPosition: number) {
        super();
        this.connectorKey = connector.key;
        this.position = position;
        this.newPosition = newPosition;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.changeConnectorTextPosition(connector, this.position, this.newPosition);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.changeConnectorTextPosition(connector, this.newPosition, this.position);
    }
}
