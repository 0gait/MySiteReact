import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Connector } from "../../Model/Connectors/Connector";
import { ItemKey } from "../../Model/DiagramItem";

export class ChangeConnectorTextHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    text: string;
    position: number;
    oldText: string;

    constructor(connector: Connector, position: number, text: string) {
        super();
        this.connectorKey = connector.key;
        this.text = text;
        this.position = position;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldText = connector.getText(this.position);
        manipulator.changeConnectorText(connector, this.text, this.position);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.changeConnectorText(connector, this.oldText, this.position);
    }
}
