import { Connector } from "../../Model/Connectors/Connector";
import { DiagramMouseEvent } from "../Event";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { DiagramModel } from "../../Model/Model";
import { ChangeConnectorTextPositionHistoryItem } from "../../History/Properties/ChangeConnectorTextPositionHistoryItem";
import { ItemKey } from "../../Model/DiagramItem";
import { ChangeConnectorTextHistoryItem } from "../../History/Properties/ChangeConnectorTextHistoryItem";

export class MouseHandlerMoveConnectorTextState extends MouseHandlerDraggingState {
    connector: Connector;
    position: number;
    text: string;
    savedText: string;

    constructor(handler: MouseHandler, history: History, protected model: DiagramModel) {
        super(handler, history);
    }

    onMouseDown(evt: DiagramMouseEvent) {
        this.connector = this.model.findConnector(evt.source.key);
        this.position = parseFloat(evt.source.value);
        this.text = this.connector.getText(this.position);
        this.savedText = "";

        super.onMouseDown(evt);
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        const newPosition = this.connector.getTextPositionByPoint(evt.modelPoint);
        if(newPosition !== this.position) {
            const text = this.connector.getText(newPosition);
            if(text !== "" && text !== this.text) {
                this.history.addAndRedo(
                    new ChangeConnectorTextHistoryItem(this.connector, newPosition, "")
                );
                this.savedText = text;
            }
            this.history.addAndRedo(
                new ChangeConnectorTextPositionHistoryItem(this.connector, this.position, newPosition)
            );
            if(this.savedText !== "" && this.savedText !== text) {
                this.history.addAndRedo(
                    new ChangeConnectorTextHistoryItem(this.connector, this.position, this.savedText)
                );
                this.savedText = "";
            }
            this.position = newPosition;
        }
    }

    getDraggingElementKeys(): ItemKey[] {
        return [this.connector.key];
    }
}
