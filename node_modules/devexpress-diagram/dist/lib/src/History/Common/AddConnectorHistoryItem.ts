import { HistoryItem } from "../HistoryItem";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Connector } from "../../Model/Connectors/Connector";
import { ItemKey, ItemDataKey } from "../../Model/DiagramItem";
import { ConnectorRenderPointsContext } from "../../Model/Connectors/Routing/ConnectorRenderPointsContext";

export class AddConnectorHistoryItem extends HistoryItem {
    private points: Point[];
    connectorKey: ItemKey;
    private dataKey: ItemDataKey;
    private renderPointsContext: ConnectorRenderPointsContext;

    constructor(points: Point[], dataKey?: ItemDataKey, renderPointsContext?: ConnectorRenderPointsContext) {
        super();
        this.points = points;
        this.dataKey = dataKey;
        this.renderPointsContext = renderPointsContext;
    }
    redo(manipulator: ModelManipulator): void {
        const connector = new Connector(this.points);
        if(this.dataKey !== undefined)
            connector.dataKey = this.dataKey;
        if(this.renderPointsContext !== undefined)
            connector.replaceRenderPoints(this.renderPointsContext);
        manipulator.addConnector(connector, this.connectorKey);
        this.connectorKey = connector.key;
    }
    undo(manipulator: ModelManipulator): void {
        const connector = manipulator.model.findConnector(this.connectorKey);
        manipulator.deleteConnector(connector);
    }
}
