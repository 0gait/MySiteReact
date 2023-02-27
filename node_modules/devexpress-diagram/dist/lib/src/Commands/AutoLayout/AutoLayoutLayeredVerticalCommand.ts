import { Graph } from "../../Layout/Graph";
import { NodeInfo } from "../../Layout/NodeLayout";
import { AutoLayoutCommandBase } from "./AutoLayoutCommandBase";
import { GraphLayout } from "../../Layout/GraphLayout";
import { SugiyamaLayoutBuilder } from "../../Layout/Builders/Sugiyama";
import { LayoutSettings, DataLayoutOrientation } from "../../Layout/LayoutSettings";

export class AutoLayoutLayeredVerticalCommand extends AutoLayoutCommandBase {
    createLayoutSettings(): LayoutSettings {
        const settings = new LayoutSettings();
        settings.orientation = DataLayoutOrientation.Vertical;
        return settings;
    }
    createLayout(settings: LayoutSettings, graph: Graph<NodeInfo>): GraphLayout {
        return new SugiyamaLayoutBuilder(settings, graph).build();
    }
}
