import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramMouseEvent } from "../Event";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";
import { ModelUtils } from "../../Model/ModelUtils";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { DiagramModel } from "../../Model/Model";
import { ItemKey } from "../../Model/DiagramItem";

export class MouseHandlerMoveConnectorSideState extends MouseHandlerDraggingState {
    startPoint: Point;
    connectorKey: ItemKey;
    pointIndex: number;
    pointCreated: boolean;

    constructor(handler: MouseHandler, history: History, protected model: DiagramModel) {
        super(handler, history);
    }

    onMouseDown(evt: DiagramMouseEvent) {
        this.startPoint = evt.modelPoint;
        this.connectorKey = evt.source.key;
        this.pointIndex = parseInt(evt.source.value) + 1;
        super.onMouseDown(evt);
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        const point = this.getSnappedPoint(evt, evt.modelPoint);
        const connector = this.model.findConnector(this.connectorKey);
        if(!this.pointCreated) {
            this.handler.addInteractingItem(connector);
            ModelUtils.addConnectorPoint(this.history, this.connectorKey, this.pointIndex, point.clone());
            this.pointCreated = true;
        }
        else
            ModelUtils.moveConnectorPoint(this.history, connector, this.pointIndex, point);
        this.handler.tryUpdateModelSize();
    }
    onFinishWithChanges() {
        const connector = this.model.findConnector(this.connectorKey);
        ModelUtils.deleteConnectorUnnecessaryPoints(this.history, connector);
        ModelUtils.fixConnectorBeginEndConnectionIndex(this.history, connector);
        this.handler.tryUpdateModelSize();
    }

    getDraggingElementKeys(): ItemKey[] {
        return [this.connectorKey];
    }
}
