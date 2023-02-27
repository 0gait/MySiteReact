import { Point } from "@devexpress/utils/lib/geometry/point";

import { ConnectorRenderPointsContext } from "../../Model/Connectors/Routing/ConnectorRenderPointsContext";
import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { HistoryItem } from "../HistoryItem";

export class AddConnectorPointHistoryItem extends HistoryItem {
    renderContext: ConnectorRenderPointsContext | undefined;
    constructor(
        private connectorKey: ItemKey,
        private pointIndex: number,
        private point: Point) {
        super();
    }
    redo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.renderContext = connector.tryCreateRenderPointsContext();
        manipulator.addDeleteConnectorPoint(
            connector,
            connector => {
                connector.addPoint(this.pointIndex, this.point);
                connector.onAddPoint(this.pointIndex, this.point);
            });
    }
    undo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.addDeleteConnectorPoint(
            connector,
            connector => {
                connector.deletePoint(this.pointIndex);
                connector.replaceRenderPoints(this.renderContext);
            });
    }
}
