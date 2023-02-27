import { DiagramMouseEvent } from "../Event";
import { MouseHandlerStateBase } from "./MouseHandlerStateBase";
import { ToggleShapeExpandedHistoryItem } from "../../History/Properties/ToggleShapeExpandedHistoryItem";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { Selection } from "../../Selection/Selection";
import { DiagramModel } from "../../Model/Model";
import { ModelUtils } from "../../Model/ModelUtils";

export class MouseHandlerToggleShapeExpandedState extends MouseHandlerStateBase {
    constructor(handler: MouseHandler, protected history: History, protected model: DiagramModel, protected selection: Selection) {
        super(handler);
    }

    onMouseUp(evt: DiagramMouseEvent) {
        const shape = this.model.findShape(evt.source.key);
        if(shape && !shape.isLocked) {
            this.history.beginTransaction();
            this.history.addAndRedo(new ToggleShapeExpandedHistoryItem(shape));

            ModelUtils.updateShapeAttachedConnectors(this.history, this.model, shape);
            ModelUtils.updateContainerConnectorsAttachedPoints(this.history, this.model, shape);

            ModelUtils.updateSelection(this.history, this.selection);

            this.handler.tryUpdateModelSize();
            this.history.endTransaction();

            this.handler.raiseClick([shape.key]);
        }
        this.handler.switchToDefaultState();
    }
}
