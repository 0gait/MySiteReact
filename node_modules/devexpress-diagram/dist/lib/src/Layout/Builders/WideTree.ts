import { GraphLayout } from "../GraphLayout";
import { Tree } from "../Tree";
import { NodeLayout, EdgeLayout, NodeInfo } from "../NodeLayout";
import { Range } from "../../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { LayoutBuilder } from "./BaseBuilder";
import { ConnectionMode, Edge } from "../Structures";
import { ConnectionPointSide } from "../../Model/DiagramItem";
import { TreeLayoutSettings, Alignment, DataLayoutOrientation, LogicalDirectionKind } from "../LayoutSettings";
import { Graph } from "../Graph";

export class TreeLayoutBuilder extends LayoutBuilder<TreeLayoutSettings> {
    private nodeToLevel: {[key: string]: number} = {};
    private levelDepthSize: {[level: number]: number} = {};

    build(): GraphLayout {
        const layout = new GraphLayout();
        let offset = 0;
        this.graph.getConnectedComponents().forEach(c => {
            const tree = Tree.createSpanningTree(c);
            const componentLayout = this.processTree(tree);
            let subOffset = this.getComponentOffset(componentLayout);
            while(componentLayout.nodeKeys.length < c.nodes.length) {
                const subGraph = new Graph<NodeInfo>(
                    c.nodes.filter(n => !componentLayout.nodeToLayout[n]).map(n => c.getNode(n)),
                    c.edges.filter(e => !componentLayout.edgeToPosition[e.key])
                );
                const subTree = Tree.createSpanningTree(subGraph);
                const subComponentLayout = this.processTree(subTree);
                componentLayout.extend(this.setComponentOffset(subComponentLayout, subOffset));
                subOffset += this.getComponentOffset(subComponentLayout);
            }

            layout.extend(this.setComponentOffset(componentLayout, offset));
            offset += this.getComponentOffset(componentLayout);
        });
        return layout;
    }

    protected preProcessTree(tree: Tree<NodeInfo>, parents: NodeInfo[], level: number) {
        parents = parents.filter(p => (this.nodeToLevel[p.key] === undefined ? (this.nodeToLevel[p.key] = level) : -1) >= 0);
        if(parents.length) {
            const maxDepthSize = this.getMaxDepthSize(parents);
            this.levelDepthSize[level] = maxDepthSize;
            this.preProcessTree(tree, [].concat(...parents.map(p => tree.getChildren(p))), level + 1);
        }
    }

    protected loadNodes(tree: Tree<NodeInfo>, layout: GraphLayout, parent?: NodeLayout): NodeLayout[] {
        if(!parent)
            return [layout.addNode(new NodeLayout(tree.root, Point.zero()))];
        return tree.getChildren(parent.info).map(child => {
            return !layout.hasNode(child.key) ? layout.addNode(new NodeLayout(child, Point.zero())) : undefined;
        }).filter(nl => nl);
    }

    protected processTree(tree: Tree<NodeInfo>): GraphLayout {
        const layout = new GraphLayout();
        this.preProcessTree(tree, [tree.root], 0);
        this.processLevel(tree, layout, 0, new Range(0), 0);
        if(this.settings.direction === LogicalDirectionKind.Backward) {
            const levelDepths = Object.keys(this.levelDepthSize).map(l => this.levelDepthSize[l]);
            const mostDepthPos = levelDepths.reduce((acc, v) => acc + v, 0) + (levelDepths.length - 1) * this.settings.layerSpacing;
            layout.forEachNode(n => this.setDepthPos(n, this.getDepthPos(n) + mostDepthPos));
        }
        return layout;
    }
    protected processLevel(tree: Tree<NodeInfo>, layout: GraphLayout, depthPos: number, breadthParentRange: Range, level: number, parent?: NodeLayout) {
        const nodes = this.addNodes(tree, layout, level, parent);
        const parentEdges = parent ? this.graph.getAdjacentEdges(parent.key, ConnectionMode.Outgoing) : [];
        const maxDepthSize = this.getDirectionValue(this.levelDepthSize[level]);
        const layerSpacing = this.getDirectionValue(this.settings.layerSpacing);
        let prevRange: Range;
        nodes.forEach(node => {
            const range = Range.fromLength(prevRange ? (prevRange.to + this.settings.columnSpacing) : breadthParentRange.from, this.getBreadthNodeSizeCore(node.info));
            node.position = this.getNodePosition(range.from, depthPos, maxDepthSize).clone().offset(node.info.margin.left, node.info.margin.top);
            this.processLevel(tree, layout, depthPos + maxDepthSize + layerSpacing, range, level + 1, node);
            this.updateEdgeConnections(layout, parentEdges, node);
            breadthParentRange.extend(range);
            prevRange = range;
        });
        if(parent && nodes.length) {
            const lastChild = nodes[nodes.length - 1];
            const childRange = new Range(this.getBreadthPos(nodes[0]), this.getBreadthPos(lastChild) + this.getBreadthNodeSizeCore(lastChild.info, true));
            this.alignParent(parent, childRange, breadthParentRange);
        }
    }

    protected addNodes(tree: Tree<NodeInfo>, layout: GraphLayout, level: number, parent?: NodeLayout): NodeLayout[] {
        if(level === 0)
            return [layout.addNode(new NodeLayout(tree.root, Point.zero()))];
        return tree.getChildren(parent.info)
            .reduce<NodeLayout[]>((acc, n) => {
                if(this.nodeToLevel[n.key] === level && !layout.hasNode(n.key))
                    acc.push(layout.addNode(new NodeLayout(n, Point.zero())));
                return acc;
            }, []);
    }

    protected getMaxDepthSize(nodes: NodeInfo[]) {
        return nodes.reduce((acc, node) => Math.max(acc, this.getDepthNodeSizeCore(node)), 0); 
    }
    protected getNodePosition(breadthPos: number, depthPos: number, maxDepthSide: number) {
        if(this.settings.direction === LogicalDirectionKind.Forward)
            return this.settings.orientation === DataLayoutOrientation.Vertical ? new Point(breadthPos, depthPos) : new Point(depthPos, breadthPos);
        return this.settings.orientation === DataLayoutOrientation.Vertical ? new Point(breadthPos, depthPos + maxDepthSide) : new Point(depthPos + maxDepthSide, breadthPos);
    }
    protected updateEdgeConnections(layout: GraphLayout, edges: Edge[], node: NodeLayout) {
        edges.filter(e => e.to === node.key).forEach(e => {
            const beginIndex = this.getBeginEdgeIndex();
            const endIndex = this.getEndEdgeIndex();
            layout.addEdge(new EdgeLayout(e.key, beginIndex, endIndex));
        });
    }
    protected getBeginEdgeIndex() {
        if(this.settings.direction === LogicalDirectionKind.Forward)
            return this.isVertical() ? ConnectionPointSide.South : ConnectionPointSide.East;
        return this.isVertical() ? ConnectionPointSide.North : ConnectionPointSide.West;
    }
    protected getEndEdgeIndex() {
        if(this.settings.direction === LogicalDirectionKind.Forward)
            return this.isVertical() ? ConnectionPointSide.North : ConnectionPointSide.West;
        return this.isVertical() ? ConnectionPointSide.South : ConnectionPointSide.East;
    }
    protected alignParent(parent: NodeLayout, childRange: Range, availableRange: Range) {
        if(this.settings.alignment === Alignment.Center) {
            const alignedPosition = childRange.from + childRange.length / 2 - this.getBreadthNodeSizeCore(parent.info, true) / 2;
            if(this.settings.orientation === DataLayoutOrientation.Vertical) {
                parent.position.x = Math.max(availableRange.from + parent.info.margin.left, alignedPosition);
                parent.position.x = Math.min(availableRange.to - parent.info.size.width - parent.info.margin.right, parent.position.x);
            }
            else {
                parent.position.y = Math.max(availableRange.from + parent.info.margin.top, alignedPosition);
                parent.position.y = Math.min(availableRange.to - parent.info.size.height - parent.info.margin.bottom, parent.position.y);
            }
        }
    }
    protected getDepthPos(node: NodeLayout): number {
        return this.settings.orientation === DataLayoutOrientation.Vertical ? node.position.y : node.position.x;
    }
    protected getBreadthPos(node: NodeLayout): number {
        return this.settings.orientation === DataLayoutOrientation.Vertical ? node.position.x : node.position.y;
    }
    protected setDepthPos(node: NodeLayout, pos: number) {
        if(this.settings.orientation === DataLayoutOrientation.Vertical)
            node.position.y = pos;
        else
            node.position.x = pos;
    }
    protected isVertical() {
        return this.settings.orientation === DataLayoutOrientation.Vertical;
    }
}
