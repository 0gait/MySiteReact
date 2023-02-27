import { Edge, ConnectionMode } from "./Structures";
import { ItemKey } from "../Model/DiagramItem";
import { Shape } from "../Model/Shapes/Shape";
import { Connector } from "../Model/Connectors/Connector";
import { IKeyOwner } from "../Interfaces";
import { SearchUtils } from "@devexpress/utils/lib/utils/search";
import { HashSet, KeySet } from "../ListUtils";

export interface IEdge extends IKeyOwner {
    from: ItemKey;
    to: ItemKey;
}

abstract class GraphBase<TNode extends IKeyOwner, TEdge extends IEdge> {
    private nodeMap: { [key: string]: TNode } = {};
    private edgeMap: { [key: string]: TEdge } = {};
    nodes: ItemKey[] = [];
    get items(): TNode[] {
        return this.nodes.map(this.getNode.bind(this));
    }
    edges: TEdge[] = [];
    constructor(nodes: TNode[], edges: TEdge[]) {
        this.onInit();
        nodes.forEach(this.addNode.bind(this));
        edges.forEach(this.addEdge.bind(this));
    }
    protected onInit() {}
    addEdge(edge: TEdge) {
        this.edgeMap[edge.key] = edge;
        this.edges.push(edge);
    }
    addNode(node: TNode) {
        this.nodeMap[node.key] = node;
        this.nodes.push(node.key);
    }
    getNode(key: ItemKey): TNode {
        return this.nodeMap[key];
    }
    getEdge(key: ItemKey): TEdge {
        return this.edgeMap[key];
    }
    isEmpty(): boolean {
        return !this.nodes.length && !this.edges.length;
    }

    getAdjacentEdges(nodeKey: ItemKey, connectionMode: ConnectionMode = ConnectionMode.OutgoingAndIncoming): TEdge[] {
        return this.edges.filter(e =>
            connectionMode & ConnectionMode.Incoming && e.to === nodeKey ||
            connectionMode & ConnectionMode.Outgoing && e.from === nodeKey
        );
    }

    abstract createIterator(connectionMode: ConnectionMode): GraphIterator<TNode, TEdge>;
}

export class Graph<T extends IKeyOwner> extends GraphBase<T, Edge> {
    cast<TNew extends IKeyOwner>(castNode: (node: T) => TNew, castEdge?: (edge: Edge) => Edge): Graph<TNew> {
        const newNodes = this.nodes.map(nk => castNode(this.getNode(nk)));
        const newEdges = this.edges.map(e => castEdge ? castEdge(e) : e);
        return new Graph<TNew>(newNodes, newEdges);
    }
    getConnectedComponents(): Graph<T>[] {
        const iterator = this.createIterator(ConnectionMode.OutgoingAndIncoming);
        iterator.visitEachEdgeOnce = true;
        const components: Graph<T>[] = [];
        for(let i = 0; i < this.nodes.length; i++) {
            const nodes: T[] = [];
            const edges: Edge[] = [];
            iterator.onNode = n => nodes.push(n);
            iterator.onEdge = e => edges.push(e);
            iterator.iterate(this.nodes[i]);
            if(nodes.length)
                components.push(new Graph<T>(nodes, edges));
        }
        return components;
    }
    createIterator(connectionMode: ConnectionMode): GraphIterator<T, Edge> {
        const iterator = new GraphIterator(this, connectionMode);
        iterator.comparer = (a, b) => a.weight - b.weight;
        return iterator;
    }

    getSpanningGraph(rootKey: ItemKey, connectionMode: ConnectionMode, edgeWeightFunc: (e: Edge) => number = undefined): Graph<T> {
        if(!this.nodes.length)
            return new Graph<T>([], []);
        if(!edgeWeightFunc)
            edgeWeightFunc = (e) => e.weight;
        let sortedAdjacentEdges: Edge[] = [];
        const spanningTreeNodesSet = new HashSet<ItemKey>();
        const spanningTreeEdgesSet = new HashSet<Edge>([], e => e.getHashKey());
        this.addNodeToSpanningGraph(rootKey, connectionMode, sortedAdjacentEdges, spanningTreeNodesSet, spanningTreeEdgesSet, edgeWeightFunc);
        while(sortedAdjacentEdges.length && spanningTreeNodesSet.length !== this.nodes.length) {
            const minWeighedEdge = sortedAdjacentEdges.shift();
            spanningTreeEdgesSet.tryPush(minWeighedEdge);
            const node = spanningTreeNodesSet.contains(minWeighedEdge.from) ? minWeighedEdge.to : minWeighedEdge.from;
            this.addNodeToSpanningGraph(node, connectionMode, sortedAdjacentEdges, spanningTreeNodesSet, spanningTreeEdgesSet, edgeWeightFunc);
            sortedAdjacentEdges = sortedAdjacentEdges.filter(e => !spanningTreeNodesSet.contains(e.from) || !spanningTreeNodesSet.contains(e.to));
        }
        return new Graph<T>(
            spanningTreeNodesSet.list().map(nk => this.getNode(nk)),
            spanningTreeEdgesSet.list()
        );
    }

    private addNodeToSpanningGraph(nodeKey: ItemKey, connectionMode: ConnectionMode, adjacentEdges: Edge[],
        spanningTreeNodesSet: HashSet<ItemKey>, spanningTreeEdgesSet: HashSet<Edge>, edgeWeightFunc: (e: Edge) => number) {
        spanningTreeNodesSet.tryPush(nodeKey);
        this.getAdjacentEdges(nodeKey, connectionMode)
            .filter(e => !spanningTreeEdgesSet.contains(e))
            .forEach(e => {
                const weight = edgeWeightFunc(e);
                let pos = SearchUtils.binaryIndexOf(adjacentEdges, a => a.weight - weight);
                pos = pos < 0 ? ~pos : pos;
                while(pos < adjacentEdges.length && edgeWeightFunc(adjacentEdges[pos]) === weight)
                    pos++;
                adjacentEdges.splice(pos, 0, new Edge(e.key, e.from, e.to, weight));
            });
    }

    static create(shapes: Shape[], connectors: Connector[]) {
        const nodes = shapes;
        const edges = connectors
            .filter(i => i.beginItem && i.endItem instanceof Shape && i.endItem && i.endItem instanceof Shape && i.beginItem !== i.endItem) 
            .map(i => new Edge(i.key, i.beginItem && i.beginItem.key, i.endItem && i.endItem.key));
        return new Graph<Shape>(nodes, edges);
    }
}


export class FastGraph<TNode extends IKeyOwner, TEdge extends IEdge = IEdge> extends GraphBase<TNode, TEdge> {
    private parentToChildren: {[parentKey: string]: ItemKey[]};
    private childToParents: {[childKey: string]: ItemKey[]};
    protected onInit() {
        this.parentToChildren = {};
        this.childToParents = {};
    }
    addEdge(edge: TEdge) {
        super.addEdge(edge);
        (this.parentToChildren[edge.from] || (this.parentToChildren[edge.from] = [])).push(edge.to);
        (this.childToParents[edge.to] || (this.childToParents[edge.to] = [])).push(edge.from);
    }
    getChildren(parent: ItemKey): ItemKey[] {
        return this.parentToChildren[parent] || [];
    }
    getParents(child: ItemKey): ItemKey[] {
        return this.childToParents[child] || [];
    }
    createIterator(connectionMode: ConnectionMode): GraphIterator<TNode, TEdge> {
        return new GraphIterator<TNode, TEdge>(this, connectionMode);
    }
}

export class GraphIterator<TNode extends IKeyOwner, TEdge extends IEdge> {
    onNode: (node: TNode) => void;
    skipNode: (node: TNode) => boolean;
    skipEdge: (edge: TEdge) => boolean;
    onEdge: (edge: TEdge, outgoing: boolean) => void;
    onAfterEdge: (edge: TEdge, outgoing: boolean) => void;
    onAllEdges: (node: TNode, outgoing: boolean) => void;
    comparer: (a: TEdge, b: TEdge) => number;

    visitEachEdgeOnce: boolean = true;
    visitEachNodeOnce: boolean = true;

    private visitedNodes: KeySet = {};
    private visitedEdges: KeySet = {};

    constructor(private graph: GraphBase<TNode, TEdge>, private connectionMode: ConnectionMode = ConnectionMode.OutgoingAndIncoming) { }

    iterate(nodeKey: ItemKey) {
        if(!this.visitEachNodeOnce && !this.visitEachEdgeOnce && !this.skipNode)
            throw "skipNode or visitEachNodeOnce or visitEachEdgeOnce must be set to avoid SOF";
        this.iterateCore(nodeKey);
    }
    private iterateCore(nodeKey: ItemKey) {
        const node = this.graph.getNode(nodeKey);
        if(!node || (this.skipNode && this.skipNode(node)) || (this.visitEachNodeOnce && this.isNodeVisited(nodeKey)))
            return;
        this.visitedNodes[nodeKey] = true;
        this.onNode && this.onNode(node);
        let edges = this.graph.getAdjacentEdges(nodeKey, this.connectionMode);
        if(this.skipEdge)
            edges = edges.filter(e => !this.skipEdge(e));
        if(this.connectionMode & ConnectionMode.Outgoing) {
            const outgoing = edges.filter(e => e.from === nodeKey);
            if(this.comparer)
                outgoing.sort(this.comparer);
            outgoing.forEach(e => {
                if(this.visitEachEdgeOnce && this.visitedEdges[e.key])
                    return;
                this.visitedEdges[e.key] = true;
                this.onEdge && this.onEdge(e, true);
                this.iterateCore(e.to);
                this.onAfterEdge && this.onAfterEdge(e, true);
            });
        }
        this.onAllEdges && this.onAllEdges(node, true);
        if(this.connectionMode & ConnectionMode.Incoming) {
            const incoming = edges.filter(e => e.to === nodeKey);
            if(this.comparer)
                incoming.sort(this.comparer);
            incoming.forEach(e => {
                if(this.visitEachEdgeOnce && this.visitedEdges[e.key])
                    return;
                this.visitedEdges[e.key] = true;
                this.onEdge && this.onEdge(e, false);
                this.iterateCore(e.from);
                this.onAfterEdge && this.onAfterEdge(e, false);
            });
        }
        this.onAllEdges && this.onAllEdges(node, false);
    }
    isNodeVisited(nodeKey: ItemKey): boolean {
        return !!this.visitedNodes[nodeKey];
    }
    isEdgeVisited(edgeKey: ItemKey): boolean {
        return !!this.visitedEdges[edgeKey];
    }
}
