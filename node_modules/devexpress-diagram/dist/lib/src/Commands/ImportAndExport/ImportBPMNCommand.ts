import { SimpleCommandState } from "../CommandStates";
import { BPMNImporter, BPMNNode } from "../../ImportAndExport/BPMNImporter";
import { ModelUtils } from "../../Model/ModelUtils";
import { AddShapeHistoryItem } from "../../History/Common/AddShapeHistoryItem";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ItemKey } from "../../Model/DiagramItem";
import { Connector, ConnectorPosition } from "../../Model/Connectors/Connector";
import { AddConnectorHistoryItem } from "../../History/Common/AddConnectorHistoryItem";
import { AddConnectionHistoryItem } from "../../History/Common/AddConnectionHistoryItem";
import { SugiyamaLayoutBuilder } from "../../Layout/Builders/Sugiyama";
import { LayoutSettings } from "../../Layout/LayoutSettings";
import { Shape } from "../../Model/Shapes/Shape";
import { Graph } from "../../Layout/Graph";
import { ExportImportCommandBase } from "./ExportImportCommandBase";

export class ImportBPMNCommand extends ExportImportCommandBase {
    executeCore(state: SimpleCommandState, parameter: string): boolean {
        const importer = new BPMNImporter(parameter);
        const graph = importer.import();
        this.updateModel(graph);
        return true;
    }
    private updateModel(graph: Graph<BPMNNode>) {
        const externalKeyToModelKey: {[key: string]: ItemKey} = {};
        const shapes: Shape[] = [];
        const connectors: Connector[] = [];
        this.control.history.beginTransaction();
        graph.items.forEach(node => {
            const insert = new AddShapeHistoryItem(this.getShapeDescription(node.type), new Point(0, 0), node.text, node.key);
            this.control.history.addAndRedo(insert);
            externalKeyToModelKey[node.key] = insert.shapeKey;
            const shape = this.control.model.findShape(insert.shapeKey);
            shapes.push(shape);
        });
        graph.edges.forEach(edge => {
            const from = this.control.model.findShape(externalKeyToModelKey[edge.from]);
            const to = this.control.model.findShape(externalKeyToModelKey[edge.to]);
            const insert = new AddConnectorHistoryItem([from.getConnectionPointPosition(0), to.getConnectionPointPosition(0)]);
            this.control.history.addAndRedo(insert);
            const connector = this.control.model.findConnector(insert.connectorKey);
            this.control.history.addAndRedo(new AddConnectionHistoryItem(connector, from, 0, ConnectorPosition.Begin));
            this.control.history.addAndRedo(new AddConnectionHistoryItem(connector, to, 0, ConnectorPosition.End));
            connectors.push(connector);
        });
        const settings = new LayoutSettings();
        const graphInfo = ModelUtils.getGraphInfoByItems(this.control.model, shapes, connectors);
        graphInfo.forEach(info => {
            const layout = new SugiyamaLayoutBuilder(settings, info.graph).build();
            const nonGraphItems = ModelUtils.getNonGraphItems(this.control.model, info.container, layout.nodeToLayout, shapes, connectors);
            ModelUtils.applyLayout(this.control.history, this.control.model, undefined, info.graph, layout, nonGraphItems,
                settings, this.control.settings.snapToGrid, this.control.settings.gridSize, false);
        });
        ModelUtils.tryUpdateModelRectangle(this.control.history);
        this.control.history.endTransaction();
    }
    private getShapeDescription(shapeType: string) {
        return this.control.shapeDescriptionManager.get(shapeType);
    }
}
