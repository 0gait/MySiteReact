import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";

export class ChangeConnectorPropertyHistoryItem extends HistoryItem {
    connectorKey: ItemKey;
    propertyName: string;
    value: any;
    oldValue: any;

    constructor(connectorKey: ItemKey, propertyName: string, value: any) {
        super();
        this.connectorKey = connectorKey;
        this.propertyName = propertyName;
        this.value = value;
    }
    redo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldValue = connector.properties[this.propertyName];
        manipulator.changeConnectorProperty(connector, this.propertyName, this.value);
    }
    undo(manipulator: ModelManipulator) {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.changeConnectorProperty(connector, this.propertyName, this.oldValue);
    }
}
