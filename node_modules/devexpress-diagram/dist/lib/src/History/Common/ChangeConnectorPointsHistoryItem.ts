import { Point } from "@devexpress/utils/lib/geometry/point";

import { Connector } from "../../Model/Connectors/Connector";
import { ConnectorRenderPointsContext } from "../../Model/Connectors/Routing/ConnectorRenderPointsContext";
import { ItemKey } from "../../Model/DiagramItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { HistoryItem } from "../HistoryItem";

export abstract class UpdateConnectorPointsHistoryItem extends HistoryItem {
    protected oldPoints: Point[];
    protected oldRenderContext: ConnectorRenderPointsContext | undefined;

    protected constructor(
        protected connectorKey: ItemKey,
        protected newPoints: Point[]) {
        super();
    }
    redo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        this.oldRenderContext = connector.tryCreateRenderPointsContext();
        this.oldPoints = connector.points.map(p => p.clone());
        manipulator.changeConnectorPoints(connector,
            connector => {
                connector.points = this.newPoints;
                this.updateRenderPoints(connector);
            });
    }
    undo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.changeConnectorPoints(connector,
            connector => {
                connector.points = this.oldPoints;
                connector.replaceRenderPoints(this.oldRenderContext);
            });
    }

    protected abstract updateRenderPoints(connector: Connector) : void;
}
export class ChangeConnectorPointsHistoryItem extends UpdateConnectorPointsHistoryItem {
    constructor(
        protected connectorKey: ItemKey,
        protected newPoints: Point[],
        private newRenderContext: ConnectorRenderPointsContext) {
        super(connectorKey, newPoints);
    }

    protected updateRenderPoints(connector: Connector): void {
        connector.replaceRenderPoints(this.newRenderContext);
    }
}
export class ReplaceConnectorPointsHistoryItem extends UpdateConnectorPointsHistoryItem {
    constructor(
        protected connectorKey: ItemKey,
        protected newPoints: Point[]) {
        super(connectorKey, newPoints);
    }
    protected updateRenderPoints(connector: Connector): void {
        connector.clearRenderPoints();
    }
}
