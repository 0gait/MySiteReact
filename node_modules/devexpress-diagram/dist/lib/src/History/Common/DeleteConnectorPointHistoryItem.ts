import { Point } from "@devexpress/utils/lib/geometry/point";
import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { ItemKey } from "../../Model/DiagramItem";
import { ConnectorRenderPointsContext } from "../../Model/Connectors/Routing/ConnectorRenderPointsContext";

export class DeleteConnectorPointHistoryItem extends HistoryItem {
    private oldPoint: Point;
    private oldRenderContext: ConnectorRenderPointsContext | undefined;

    constructor(
        protected connectorKey: ItemKey,
        private pointIndex: number) {
        super();
    }
    redo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldRenderContext = connector.tryCreateRenderPointsContext();
        this.oldPoint = connector.points[this.pointIndex].clone();
        manipulator.addDeleteConnectorPoint(connector,
            connector => {
                connector.deletePoint(this.pointIndex);
                connector.onDeletePoint(this.pointIndex);
            });
    }
    undo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.addDeleteConnectorPoint(connector,
            connector => {
                connector.addPoint(this.pointIndex, this.oldPoint);
                connector.replaceRenderPoints(this.oldRenderContext);
            });
    }
}
