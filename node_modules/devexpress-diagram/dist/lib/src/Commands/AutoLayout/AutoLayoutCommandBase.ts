import { SimpleCommandState } from "../CommandStates";
import { Graph } from "../../Layout/Graph";
import { ModelUtils } from "../../Model/ModelUtils";
import { NodeInfo } from "../../Layout/NodeLayout";
import { GraphLayout } from "../../Layout/GraphLayout";
import { LayoutSettings } from "../../Layout/LayoutSettings";
import { SimpleCommandBase } from "../SimpleCommandBase";
import { Shape } from "../../Model/Shapes/Shape";
import { Connector } from "../../Model/Connectors/Connector";
import { GeometryUtils, Utils } from "../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ScrollIntoViewOnRedoHistoryItem, ScrollIntoViewOnUndoHistoryItem } from "../../History/Common/ScrollIntoViewHistoryItem";

export abstract class AutoLayoutCommandBase extends SimpleCommandBase {
    executeCore(state: SimpleCommandState, parameter?: any): boolean {
        this.control.history.beginTransaction();
        const shapes = this.getAffectedShapes();
        const connectors = this.getAffectedConnectors();
        const settings = this.createLayoutSettings();
        const graphInfo = ModelUtils.getGraphInfoByItems(this.control.model, shapes, connectors, false);
        if(graphInfo.length) {
            let rectangle: Rectangle;
            const model = this.control.model;
            const commonRect = GeometryUtils.getCommonRectangle(
                Utils.flatten(graphInfo.map(g => g.graph.items.map(i => model.findItem(i.key))))
                    .concat(graphInfo.map(g => g.container))
                    .filter(i => i)
                    .map(i => i.rectangle));
            this.control.history.addAndRedo(new ScrollIntoViewOnUndoHistoryItem(this.control.view, commonRect));
            graphInfo.forEach(info => {
                const layout = this.createLayout(settings, info.graph);
                const nonGraphItems = ModelUtils.getNonGraphItems(this.control.model, info.container, layout.nodeToLayout, shapes, connectors);
                const layoutRect = ModelUtils.applyLayout(this.control.history, this.control.model, info.container, info.graph, layout, nonGraphItems,
                    settings, this.control.settings.snapToGrid, this.control.settings.gridSize, false);
                rectangle = rectangle && Rectangle.union(rectangle, layoutRect) || layoutRect;
            });
            ModelUtils.tryUpdateModelRectangle(this.control.history);
            this.control.history.addAndRedo(new ScrollIntoViewOnRedoHistoryItem(this.control.view, rectangle));
        }
        this.control.history.endTransaction();
        return true;
    }

    protected getAffectedShapes(): Shape[] {
        return this.control.selection.isEmpty() ?
            this.control.model.items.filter(<(i) => i is Shape>(i => i instanceof Shape && !i.locked)) :
            this.control.selection.getSelectedShapes(false, true);
    }

    protected getAffectedConnectors(): Connector[] {
        return this.control.selection.isEmpty() ?
            this.control.model.items.filter(<(i) => i is Connector>(i => i instanceof Connector && !i.locked)) :
            this.control.selection.getSelectedConnectors(false, true);
    }

    abstract createLayoutSettings(): LayoutSettings;
    abstract createLayout(settings: LayoutSettings, graph: Graph<NodeInfo>): GraphLayout;
}
