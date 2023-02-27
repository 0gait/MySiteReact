import { ItemKey } from "../Model/DiagramItem";
import { GeometryUtils } from "../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { NodeLayout, EdgeLayout } from "./NodeLayout";

export class GraphLayout {
    nodeKeys: ItemKey[] = [];
    nodeToLayout: { [nodeKey: string]: NodeLayout } = {};
    edgeToPosition: { [edgeKey: string]: EdgeLayout } = {};

    forEachNode(callback: (layout: NodeLayout, nodeKey: ItemKey) => void) {
        this.nodeKeys.forEach(nk => callback(this.nodeToLayout[nk], nk));
    }
    reduce<T>(callback: (acc: T, layout: NodeLayout, index: number) => T, initValue: T) {
        return this.nodeKeys.reduce((acc, key, index) => callback(acc, this.nodeToLayout[key], index), initValue);
    }
    addNode(nodeLayout: NodeLayout): NodeLayout {
        if(this.nodeToLayout[nodeLayout.key])
            throw Error("Node layout is already registered");
        this.nodeKeys.push(nodeLayout.key);
        this.nodeToLayout[nodeLayout.key] = nodeLayout;
        return nodeLayout;
    }
    hasNode(key: string): boolean {
        return !!this.nodeToLayout[key];
    }
    addEdge(edgeLayout: EdgeLayout) {
        if(this.edgeToPosition[edgeLayout.key])
            throw Error("Edge layout is already registered");
        this.edgeToPosition[edgeLayout.key] = edgeLayout;
    }
    getRectangle(includeMargins: boolean): Rectangle {
        return GeometryUtils.getCommonRectangle(this.nodeKeys.map(nk => this.nodeToLayout[nk].rectangle));
    }
    offsetNodes(deltaX: number = 0, deltaY: number = 0): GraphLayout {
        const layout = new GraphLayout();
        this.nodeKeys.forEach(nk => {
            const nl = this.nodeToLayout[nk];
            layout.addNode(new NodeLayout(nl.info, nl.position.clone().offset(deltaX, deltaY)));
        });
        layout.copyEdges(this);
        return layout;
    }
    extend(layout: GraphLayout) {
        layout.forEachNode(nl => this.addNode(nl));
        this.copyEdges(layout);
    }
    private copyEdges(source: GraphLayout) {
        Object.keys(source.edgeToPosition).forEach(e => {
            const edge: EdgeLayout = source.edgeToPosition[e];
            this.addEdge(new EdgeLayout(edge.key, edge.beginIndex, edge.endIndex));
        });
    }
}
