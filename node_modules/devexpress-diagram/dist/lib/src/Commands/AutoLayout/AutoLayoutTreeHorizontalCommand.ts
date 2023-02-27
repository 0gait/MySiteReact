import { Graph } from "../../Layout/Graph";
import { NodeInfo } from "../../Layout/NodeLayout";
import { AutoLayoutCommandBase } from "./AutoLayoutCommandBase";
import { TreeLayoutBuilder } from "../../Layout/Builders/WideTree";
import { TreeLayoutSettings, DataLayoutOrientation, LayoutSettings } from "../../Layout/LayoutSettings";
import { GraphLayout } from "../../Layout/GraphLayout";

export class AutoLayoutTreeHorizontalCommand extends AutoLayoutCommandBase {
    createLayoutSettings(): LayoutSettings {
        const gridSize = this.control.settings.snapToGrid ? this.control.settings.gridSize : undefined;
        const settings = new TreeLayoutSettings(gridSize);
        settings.orientation = DataLayoutOrientation.Horizontal;
        return settings;
    }
    createLayout(settings: LayoutSettings, graph: Graph<NodeInfo>): GraphLayout {
        return new TreeLayoutBuilder(<TreeLayoutSettings>settings, graph).build();
    }
}
