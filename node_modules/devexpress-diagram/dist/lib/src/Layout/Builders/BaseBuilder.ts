import { GraphLayout } from "../GraphLayout";
import { Graph } from "../Graph";
import { NodeInfo } from "../NodeLayout";
import { LayoutSettings, DataLayoutOrientation, LogicalDirectionKind } from "../LayoutSettings";

export abstract class LayoutBuilder<TSettings extends LayoutSettings> {
    constructor(
        protected settings: TSettings,
        protected graph: Graph<NodeInfo>) { }
    abstract build(): GraphLayout;

    protected getBreadthNodeSizeCore(node: NodeInfo, excludeMargins?: boolean): number {
        let size = this.settings.orientation === DataLayoutOrientation.Vertical ? node.size.width : node.size.height;
        if(!excludeMargins)
            size += this.settings.orientation === DataLayoutOrientation.Vertical ? (node.margin.left + node.margin.right) : (node.margin.top + node.margin.bottom);
        return size;
    }
    protected getDepthNodeSizeCore(node: NodeInfo): number {
        return this.settings.orientation === DataLayoutOrientation.Horizontal ?
            (node.size.width + node.margin.left + node.margin.right) :
            (node.size.height + node.margin.top + node.margin.bottom);
    }
    protected chooseDirectionValue(near: number, far: number): number {
        return this.settings.direction === LogicalDirectionKind.Forward ? near : far;
    }
    protected getDirectionValue(value: number) {
        return this.settings.direction === LogicalDirectionKind.Forward ? value : -value;
    }
    protected getComponentOffset(graphLayout: GraphLayout) {
        const rect = graphLayout.getRectangle(true);
        const offset = this.settings.orientation === DataLayoutOrientation.Vertical ? rect.width : rect.height;
        return offset + this.settings.componentSpacing;
    }
    protected setComponentOffset(graphLayout: GraphLayout, offset: number): GraphLayout {
        return this.settings.orientation === DataLayoutOrientation.Vertical ?
            graphLayout.offsetNodes(offset) :
            graphLayout.offsetNodes(0, offset);
    }
}
