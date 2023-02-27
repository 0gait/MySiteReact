import { Graph } from "./Graph";
import { Shape } from "../Model/Shapes/Shape";
import { LayoutUtils } from "./LayoutUtils";
import { NodeInfo } from "./NodeLayout";

export class GraphInfo {
    private _level: number;
    private _graph: Graph<NodeInfo>;

    constructor(public container: Shape, public sourceGraph: Graph<Shape>) {
    }

    get graph(): Graph<NodeInfo> {
        return this._graph || (this._graph = this.getNodeInfoGraph());
    }
    get level(): number {
        return this._level !== undefined ? this._level : (this._level = this.getLevel());
    }

    private getNodeInfoGraph(): Graph<NodeInfo> {
        return this.sourceGraph.cast(LayoutUtils.shapeToLayout);
    }
    private getLevel(): number {
        let level = 0;
        if(this.container)
            level = this.getContainerLevel(this.container);
        return level;
    }
    private getContainerLevel(container: Shape): number {
        let level = 1;
        const parentContainer = container.container;
        if(parentContainer)
            level += this.getContainerLevel(parentContainer);
        return level;
    }
}
