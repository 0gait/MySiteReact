import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramMouseEvent } from "../Event";
import { MouseHandlerMoveConnectorPointStateBase } from "./MouseHandlerMoveConnectorPointStateBase";
import { ConnectorPosition } from "../../Model/Connectors/Connector";
import { ModelUtils } from "../../Model/ModelUtils";
import { ConnectorLineOption } from "../../Model/Connectors/ConnectorProperties";

export class MouseHandlerMoveConnectorPointState extends MouseHandlerMoveConnectorPointStateBase {
    onMouseDown(evt: DiagramMouseEvent) {
        this.connector = this.model.findConnector(evt.source.key);
        this.pointIndex = parseInt(evt.source.value);
        if(this.pointIndex === 0)
            this.pointPosition = ConnectorPosition.Begin;
        else if(this.pointIndex === this.connector.points.length - 1)
            this.pointPosition = ConnectorPosition.End;

        this.handler.addInteractingItem(this.connector);
        super.onMouseDown(evt);
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        if(this.connector.properties.lineOption !== ConnectorLineOption.Orthogonal ||
            this.pointIndex === 0 || this.pointIndex === this.connector.points.length - 1)
            super.onApplyChanges(evt);
    }
    onFinishWithChanges() {
        super.onFinishWithChanges();
        ModelUtils.deleteConnectorUnnecessaryPoints(this.history, this.connector);
        this.handler.tryUpdateModelSize();
    }
    getSnappedPoint(evt: DiagramMouseEvent, point: Point): Point {
        const points = this.connector.points;
        const index = this.pointIndex;
        if(0 < index && index < points.length - 1) {
            const tg = (points[index + 1].y - points[index - 1].y) / (points[index + 1].x - points[index - 1].x);
            const x = point.x;
            const y = points[index + 1].y - (points[index + 1].x - x) * tg;
            return this.handler.getSnappedPointOnDragPoint(evt, point, new Point(x, y));
        }
        return this.handler.getSnappedPointOnDragPoint(evt, point);
    }
}
