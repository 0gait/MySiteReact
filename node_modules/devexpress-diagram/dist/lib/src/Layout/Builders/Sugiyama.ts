import { LayoutBuilder } from "./BaseBuilder";
import { Graph, FastGraph, IEdge } from "../Graph";
import { NodeLayout, EdgeLayout, NodeInfo } from "../NodeLayout";
import { ConnectionMode, Edge } from "../Structures";
import { ItemKey } from "../../Model/DiagramItem";
import { HashSet, IHashCodeOwner, KeySet, KeyNumberMap } from "../../ListUtils";
import { SearchUtils } from "@devexpress/utils/lib/utils/search";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { LogicalDirectionKind, DataLayoutOrientation, LayoutSettings } from "../LayoutSettings";
import { GraphLayout } from "../GraphLayout";
import { ConnectorPosition } from "../../Model/Connectors/Connector";
import { IKeyOwner } from "../../Interfaces";
import { CycleRemover } from "../Utility/CycleRemover";

type OrderInfo = {[layer: number]: NodeOnLayer[]};
type Medians = { [nodeKey: string]: EdgeOnLayer };
type AbsoluteOffsetInfo = {[coord: number]: {leftOffset: number, width: number}};

export class SugiyamaLayoutBuilder extends LayoutBuilder<LayoutSettings> {
    build(): GraphLayout {
        let offset = 0;
        const layout = new GraphLayout();
        const nodeOrderer = new SugiyamaNodesOrderer();
        this.graph.getConnectedComponents()
            .forEach(component => {
                const acyclicGraphInfo = CycleRemover.removeCycles(component);
                const layers = SugiyamaLayerDistributor.getLayers(acyclicGraphInfo.graph);
                const orderedGraph = nodeOrderer.orderNodes(acyclicGraphInfo.graph, layers);
                const removedEdges = Object.keys(acyclicGraphInfo.removedEdges).map(ek => component.getEdge(ek));
                const coordinatedGraph = nodeOrderer.assignAbsCoordinates(orderedGraph);
                const componentLayout = this.createInfoGraphLayout(coordinatedGraph, acyclicGraphInfo.reversedEdges, removedEdges);
                layout.extend(this.setComponentOffset(componentLayout, offset));
                offset += this.getComponentOffset(componentLayout);
            });
        return layout;
    }

    createInfoGraphLayout(coordinatedGraph: FastGraph<NodeOnLayer, EdgeOnLayer>, reversedEdges: KeySet, removedEdges: Edge[]): GraphLayout {
        let currentPosition: Point = new Point(0, 0);
        const items = coordinatedGraph.items;
        const sortedLayers = new HashSet(items.map(n => n.layer).sort((a, b) => a - b));
        const absOffsetInfo = this.getAbsOffsetInfo(coordinatedGraph.items);
        const positions: {[nodeKey: string]: Point} = {};
        let totalDepth = 0;
        let leftEdge = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
        let rightEdge = Number.MIN_SAFE_INTEGER || Number.MAX_VALUE;
        for(let i = 0; i < sortedLayers.length; i++) {
            const layer = sortedLayers.item(i);
            let maxDepthLayer = 0;
            items
                .filter(n => n.layer === layer)
                .sort((a, b) => a.position - b.position)
                .forEach(n => {
                    const depthNodeSize = this.getDepthNodeSize(n);
                    const directionOffset = this.chooseDirectionValue(0, depthNodeSize);
                    const absPosition = this.getAbsPosition(n.position, this.getBreadthNodeSize(n), absOffsetInfo);
                    currentPosition = this.setBreadth(currentPosition, absPosition);
                    const nodePosition = this.setDepthOffset(currentPosition, -directionOffset);
                    positions[n.key] = nodePosition;
                    if(n.isDummy) return;
                    const breadth = this.settings.orientation === DataLayoutOrientation.Horizontal ? nodePosition.y : nodePosition.x;
                    leftEdge = Math.min(leftEdge, breadth);
                    rightEdge = Math.max(rightEdge, breadth + this.getBreadthNodeSize(n));
                    maxDepthLayer = Math.max(maxDepthLayer, this.getDepthNodeSize(n));
                });
            totalDepth += maxDepthLayer;
            currentPosition = this.setBreadth(currentPosition, 0);
            currentPosition = this.setDepthOffset(currentPosition, this.getDirectionValue(maxDepthLayer + this.settings.layerSpacing));
        }
        totalDepth += (sortedLayers.length - 1) * this.settings.layerSpacing;
        const layout = new GraphLayout();
        this.createNodesLayout(coordinatedGraph, layout, leftEdge, totalDepth, positions);
        this.createEdgesLayout(coordinatedGraph, layout, reversedEdges, removedEdges);
        return layout;
    }
    createNodesLayout(infoGraph: FastGraph<NodeOnLayer, EdgeOnLayer>, layout: GraphLayout, leftEdge: number, totalDepth: number, positions: {[nodeKey: string]: Point}) {
        const offset = this.settings.orientation === DataLayoutOrientation.Vertical ?
            new Point(-leftEdge, this.chooseDirectionValue(0, totalDepth)) :
            new Point(this.chooseDirectionValue(0, totalDepth), -leftEdge);
        infoGraph.items.forEach(n => {
            if(!n.isDummy) {
                const node = this.graph.getNode(n.key);
                layout.addNode(new NodeLayout(node, positions[n.key].clone().offset(offset.x, offset.y)));
            }
        });
    }
    createEdgesLayout(infoGraph: FastGraph<NodeOnLayer, EdgeOnLayer>, layout: GraphLayout, reversedEdges: KeySet, removedEdges: Edge[]) {
        const DIRECT = this.getDirectEdgeLayout();
        const TOP_TO_BOTTOM = this.getDiffLevelEdgeLayout(true);
        const BOTTOM_TO_TOP = this.getDiffLevelEdgeLayout(false);
        const TOP_TO_TOP = this.getSameLevelEdgeLayout(true);
        const BOTTOM_TO_BOTTOM = this.getSameLevelEdgeLayout(false);
        const occupied: {[key_point: string]: ConnectorPosition} = {};
        infoGraph.edges
            .filter(e => !e.isDummy)
            .concat(removedEdges.map(e => new EdgeOnLayer(e.key, false, e.from, e.to)))
            .sort((a, b) => {
                return (infoGraph.getNode(a.originFrom).layer - infoGraph.getNode(b.originFrom).layer) ||
                    (infoGraph.getNode(a.to).layer - infoGraph.getNode(b.to).layer);
            })
            .forEach(e => {
                const isReversed = reversedEdges[e.key];
                const from = infoGraph.getNode(isReversed ? e.to : e.originFrom);
                const to = infoGraph.getNode(isReversed ? e.originFrom : e.to);
                if(to.layer - from.layer === 1)
                    layout.addEdge(new EdgeLayout(e.key, DIRECT.from, DIRECT.to));
                else {
                    const candidates: {from: number, to: number}[] = [];
                    if(to.position - from.position >= 1) {
                        candidates.push(TOP_TO_BOTTOM);
                        candidates.push({ from: DIRECT.from, to: TOP_TO_BOTTOM.to });
                        candidates.push({ from: TOP_TO_BOTTOM.from, to: DIRECT.to });
                    }
                    else if(to.position - from.position <= -1) {
                        candidates.push(BOTTOM_TO_TOP);
                        candidates.push({ from: DIRECT.from, to: BOTTOM_TO_TOP.to });
                        candidates.push({ from: BOTTOM_TO_TOP.from, to: DIRECT.to });
                    }
                    else {
                        const oneliner = from.position === to.position && to.position === 0 ? [TOP_TO_TOP, BOTTOM_TO_BOTTOM] : [BOTTOM_TO_BOTTOM, TOP_TO_TOP];
                        oneliner.forEach(c => candidates.push(c));
                        oneliner.forEach(c => {
                            candidates.push({ from: c.from, to: DIRECT.to });
                            candidates.push({ from: DIRECT.from, to: c.to });
                        });
                    }
                    candidates.push(DIRECT);
                    for(let i = 0, candidate: {from: number, to: number}; candidate = candidates[i]; i++) {
                        const fromKey = from.key + "_" + candidate.from;
                        const toKey = to.key + "_" + candidate.to;
                        if(occupied[fromKey] !== ConnectorPosition.End && occupied[toKey] !== ConnectorPosition.Begin) {
                            layout.addEdge(new EdgeLayout(e.key, candidate.from, candidate.to));
                            occupied[fromKey] = ConnectorPosition.Begin;
                            occupied[toKey] = ConnectorPosition.End;
                            break;
                        }
                    }
                }
            });
    }
    private getDirectEdgeLayout(): { from: number, to: number } {
        if(this.settings.orientation === DataLayoutOrientation.Horizontal)
            return this.settings.direction === LogicalDirectionKind.Forward ? { from: 1, to: 3 } : { from: 3, to: 1 };
        return this.settings.direction === LogicalDirectionKind.Forward ? { from: 2, to: 0 } : { from: 0, to: 2 };
    }
    private getDiffLevelEdgeLayout(topToBottom: boolean): { from: number, to: number } {
        if(this.settings.orientation === DataLayoutOrientation.Horizontal)
            return topToBottom ? { from: 2, to: 0 } : { from: 0, to: 2 };
        return topToBottom ? { from: 3, to: 1 } : { from: 1, to: 3 };
    }

    private getSameLevelEdgeLayout(topToBottom: boolean): { from: number, to: number } {
        if(this.settings.orientation === DataLayoutOrientation.Horizontal)
            return topToBottom ? { from: 0, to: 0 } : { from: 2, to: 2 };
        return topToBottom ? { from: 3, to: 3 } : { from: 1, to: 1 };
    }

    getAbsOffsetInfo(nodesInfos: NodeOnLayer[]): AbsoluteOffsetInfo {
        const absOffsetMatrix: {[coord: number]: number} = {};
        const addCell = (n: NodeOnLayer, intAbsCoord: number) => {
            if(absOffsetMatrix[intAbsCoord] === undefined)
                absOffsetMatrix[intAbsCoord] = this.getBreadthNodeSize(n);
            absOffsetMatrix[intAbsCoord] = Math.max(absOffsetMatrix[intAbsCoord], this.getBreadthNodeSize(n));
        };
        nodesInfos.forEach(n => {
            const intAbsCoord = trunc(n.position);
            addCell(n, intAbsCoord);
            if(absOffsetMatrix[intAbsCoord] % 1 !== 0)
                addCell(n, intAbsCoord + 1);
        });
        const absOffsetInfo: AbsoluteOffsetInfo = {};
        let leftOffset = 0;
        Object.keys(absOffsetMatrix).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(coord => {
            absOffsetInfo[coord] = { leftOffset: leftOffset, width: absOffsetMatrix[coord] };
            leftOffset += absOffsetMatrix[coord] + this.settings.columnSpacing;
        });
        return absOffsetInfo;
    }
    setBreadth(position: Point, breadthPosition: number): Point {
        if(this.settings.orientation === DataLayoutOrientation.Vertical)
            return new Point(breadthPosition, position.y);
        return new Point(position.x, breadthPosition);
    }
    setDepthOffset(position: Point, offset: number): Point {
        if(this.settings.orientation === DataLayoutOrientation.Horizontal)
            return new Point(position.x + offset, position.y);
        return new Point(position.x, position.y + offset);
    }
    getAbsPosition(absCoordinate: number, itemSize: number, absoluteOffsetInfo: AbsoluteOffsetInfo): number {
        const intAbsCoord = trunc(absCoordinate);
        const absLeftOffset = absoluteOffsetInfo[intAbsCoord].leftOffset;
        const cellWidth = absoluteOffsetInfo[intAbsCoord].width;
        if(absCoordinate % 1 === 0)
            return absLeftOffset + (cellWidth - itemSize) / 2;
        return absLeftOffset + cellWidth - (itemSize - this.settings.columnSpacing) / 2;
    }
    getBreadthNodeSize(node: NodeOnLayer): number {
        return node.isDummy ? 0 : this.getBreadthNodeSizeCore(this.graph.getNode(node.key));
    }
    getDepthNodeSize(node: NodeOnLayer): number {
        return node.isDummy ? 0 : this.getDepthNodeSizeCore(this.graph.getNode(node.key));
    }

}

export class SugiyamaLayerDistributor {
    static getLayers(acyclicGraph: Graph<NodeInfo>): KeyNumberMap {
        const feasibleTree = this.getFeasibleTree(acyclicGraph);
        return this.calcNodesLayers(feasibleTree);
    }
    private static getFeasibleTree(graph: Graph<NodeInfo>): Graph<NodeInfo> {
        const layers = this.initLayerAssignment(graph);
        return graph.getSpanningGraph(graph.nodes[0], ConnectionMode.OutgoingAndIncoming, (e) => layers[e.to] - layers[e.from]);
    }
    private static initLayerAssignment(graph: Graph<NodeInfo>): KeyNumberMap {
        const layers: KeyNumberMap = {};
        let currentLayer = 0;
        const actualAssignedNodes: KeySet = {};
        let assigningNodes: ItemKey[] = graph.nodes.filter(n => !graph.getAdjacentEdges(n, ConnectionMode.Incoming).length);
        while(assigningNodes.length) {
            assigningNodes.forEach(n => {
                layers[n] = currentLayer;
                actualAssignedNodes[n] = true;
            });
            Object.keys(actualAssignedNodes).forEach(n => {
                if(graph.getAdjacentEdges(n, ConnectionMode.Outgoing).filter(e => layers[e.to] === undefined).length === 0)
                    delete actualAssignedNodes[n];
            });
            const assigningNodesSet: {[nodeKey: string]: boolean} = {};
            Object.keys(actualAssignedNodes).forEach(n => {
                graph.getAdjacentEdges(n, ConnectionMode.Outgoing)
                    .map(e => e.to)
                    .filter(n => layers[n] === undefined && graph.getAdjacentEdges(n, ConnectionMode.Incoming).reduce((acc, e) => acc && layers[e.from] !== undefined, true))
                    .forEach(n => assigningNodesSet[n] = true);
            });
            assigningNodes = Object.keys(assigningNodesSet);
            currentLayer++;
        }
        return layers;
    }
    private static calcNodesLayers(graph: Graph<NodeInfo>): KeyNumberMap {
        const layers: KeyNumberMap = {};
        let minLayer = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
        let currentLevel = 0;
        const iterator = graph.createIterator(ConnectionMode.OutgoingAndIncoming);
        iterator.visitEachEdgeOnce = false;
        iterator.onNode = (n) => {
            layers[n.key] = currentLevel;
            minLayer = Math.min(minLayer, currentLevel);
        };
        iterator.skipNode = (n) => layers[n.key] !== undefined;
        iterator.skipEdge = (e) => layers[e.from] !== undefined && layers[e.to] !== undefined;
        iterator.onEdge = (e, out) => {
            if(out)
                currentLevel = layers[e.from] + 1;
            else
                currentLevel = layers[e.to] - 1;
        };
        iterator.iterate(graph.nodes[0]);
        for(const key in layers) {
            if(!Object.prototype.hasOwnProperty.call(layers, key)) continue;
            layers[key] -= minLayer;
        }
        return layers;
    }
}

export class SugiyamaNodesOrderer {
    private idCounter = -10000;
    orderNodes(graph: Graph<NodeInfo>, layers: KeyNumberMap): FastGraph<NodeOnLayer, EdgeOnLayer> {
        const maxIteration = 14; 
        let currentIteration = 1;
        const graphInfo = this.initGraphInfo(graph, layers);
        const nodeInfos = graphInfo.items;
        let orderInfo = this.initOrder(nodeInfos);
        let bestNodesPositions = this.getNodeToPositionMap(nodeInfos);
        let bestCrossCount = this.getCrossCount(orderInfo, graphInfo);
        let isParentToChildren = true;
        while(currentIteration < maxIteration && bestCrossCount !== 0) {
            orderInfo = this.getNodesOrder(orderInfo, graphInfo, isParentToChildren);
            const crossCount = this.getCrossCount(orderInfo, graphInfo);
            if(crossCount < bestCrossCount) {
                bestNodesPositions = this.getNodeToPositionMap(graphInfo.items);
                bestCrossCount = crossCount;
            }
            isParentToChildren = !isParentToChildren;
            currentIteration++;
        }
        graphInfo.items.forEach(n => n.position = bestNodesPositions[n.key]);
        return graphInfo;
    }
    private getNodesOrder(current: OrderInfo, graph: FastGraph<NodeOnLayer>, isParentToChildren: boolean): OrderInfo {
        const order: OrderInfo = {};
        for(const layer in current) {
            if(!Object.prototype.hasOwnProperty.call(current, layer)) continue;
            const nodePositions: KeyNumberMap = {};
            const nodeKeys: string[] = [];
            current[layer].forEach(ni => {
                const adjacentNodesPositions = (isParentToChildren ? graph.getChildren(ni.key) : graph.getParents(ni.key))
                    .map(nk => graph.getNode(nk).position);
                nodeKeys.push(ni.key);
                nodePositions[ni.key] = this.getNodePosition(adjacentNodesPositions);
            });
            order[layer] = this.sortNodes(nodeKeys, nodePositions, graph);
        }
        return order;
    }
    private sortNodes(nodeKeys: string[], nodePositions: KeyNumberMap, graph: FastGraph<NodeOnLayer>): NodeOnLayer[] {
        return nodeKeys
            .sort((a, b) => nodePositions[a] - nodePositions[b])
            .map((nk, index) => {
                const node = graph.getNode(nk);
                node.position = index;
                return node;
            });
    }
    private getNodePosition(adjacentNodesPositions: number[]): number {
        adjacentNodesPositions = adjacentNodesPositions.sort((a, b) => a - b);
        if(!adjacentNodesPositions.length)
            return 0;
        const medianIndex = Math.floor(adjacentNodesPositions.length / 2);
        if(adjacentNodesPositions.length === 2 || adjacentNodesPositions.length % 2 === 1)
            return adjacentNodesPositions[medianIndex];
        const leftMedianPosition = adjacentNodesPositions[medianIndex - 1] - adjacentNodesPositions[0];
        const rightMedianPosition = adjacentNodesPositions[adjacentNodesPositions.length - 1] - adjacentNodesPositions[medianIndex];
        return Math.floor(
            (adjacentNodesPositions[medianIndex - 1] * rightMedianPosition + adjacentNodesPositions[medianIndex] * leftMedianPosition) /
            (leftMedianPosition + rightMedianPosition)
        );
    }
    private initOrder(nodeInfos: NodeOnLayer[]): OrderInfo {
        const result: OrderInfo = {};
        nodeInfos.forEach(ni => (result[ni.layer] || (result[ni.layer] = [])).push(ni));
        return result;
    }
    private getCrossCount(orderInfo: OrderInfo, graph: FastGraph<NodeOnLayer>): number {
        let count = 0;
        for(const layer in orderInfo) {
            if(!Object.prototype.hasOwnProperty.call(orderInfo, layer)) continue;
            let viewedAdjacentNodesPositions: number[] = [];
            orderInfo[layer].forEach(n => {
                const positions = graph.getChildren(n.key).map(c => graph.getNode(c).position);
                positions.forEach(p => {
                    count += viewedAdjacentNodesPositions.filter(vp => p < vp).length;
                });
                viewedAdjacentNodesPositions = viewedAdjacentNodesPositions.concat(positions);
            });
        }
        return count;
    }
    private initGraphInfo(graph: Graph<NodeInfo>, layers: KeyNumberMap): FastGraph<NodeOnLayer, EdgeOnLayer> {
        const countNodesOnLayer: {[layer: number]: number} = {};
        const nodesInfoMap: {[nodeKey: string]: NodeOnLayer} = {};
        const nodeInfos: NodeOnLayer[] = [];
        const edgeInfos: EdgeOnLayer[] = [];

        graph.nodes.forEach(n => {
            const layer = layers[n];
            if(countNodesOnLayer[layer] === undefined)
                countNodesOnLayer[layer] = 0;
            const info = new NodeOnLayer(n, false, layer, countNodesOnLayer[layer]++);
            nodesInfoMap[n] = info;
            nodeInfos.push(info);
        });
        graph.edges.forEach(e => {
            const span = layers[e.to] - layers[e.from];
            if(span > 1) {
                let prevNodeInfo = nodesInfoMap[e.from];
                for(let delta = 1; delta < span; delta++) {
                    const dNodeInfo = new NodeOnLayer(this.createDummyID(), true, layers[e.from] + delta, countNodesOnLayer[layers[e.from] + delta]++);
                    edgeInfos.push(new EdgeOnLayer(this.createDummyID(), true, prevNodeInfo.key, dNodeInfo.key));
                    nodeInfos.push(dNodeInfo);
                    prevNodeInfo = dNodeInfo;
                }
                edgeInfos.push(new EdgeOnLayer(e.key, false, prevNodeInfo.key, nodesInfoMap[e.to].key, nodesInfoMap[e.from].key));
            }
            else
                edgeInfos.push(new EdgeOnLayer(e.key, false, nodesInfoMap[e.from].key, nodesInfoMap[e.to].key));
        });
        return new FastGraph(nodeInfos, edgeInfos);
    }
    private createDummyID(): string {
        return "dummy_" + --this.idCounter;
    }
    private getNodeToPositionMap(nodeInfos: NodeOnLayer[]): KeyNumberMap {
        return nodeInfos.reduce((acc, ni) => {
            acc[ni.key] = ni.position;
            return acc;
        }, {});
    }


    assignAbsCoordinates(graph: FastGraph<NodeOnLayer, EdgeOnLayer>): FastGraph<NodeOnLayer, EdgeOnLayer> {
        const absCoordinates = this.getAbsCoodinate(graph);
        return new FastGraph(
            graph.items.map(n => new NodeOnLayer(n.key, n.isDummy, n.layer, absCoordinates[n.key])),
            graph.edges.slice(0)
        );
    }
    private getAbsCoodinate(graph: FastGraph<NodeOnLayer, EdgeOnLayer>): KeyNumberMap {
        const orderInfo: OrderInfo = graph.items.reduce<OrderInfo>((acc, n) => {
            acc[n.layer] = acc[n.layer] || [];
            const pos = SearchUtils.binaryIndexOf(acc[n.layer], ni => ni.position - n.position);
            acc[n.layer].splice(pos < 0 ? ~pos : pos, 0, n);
            return acc;
        }, {});
        const medianPositions =
            [MedianAlignmentMode.TopLeft, MedianAlignmentMode.TopRight, MedianAlignmentMode.BottomLeft, MedianAlignmentMode.BottomRight]
                .map(alignment => this.getPositionByMedian(graph, alignment, orderInfo));
        const nodeToPosition: KeyNumberMap = {};
        graph.items.forEach(n => {
            const posList: number[] = medianPositions.map(positions => positions[n.key]).sort((a, b) => a - b);
            nodeToPosition[n.key] = (posList[1] + posList[2]) / 2;
        });
        return nodeToPosition;
    }
    private getPositionByMedian(graph: FastGraph<NodeOnLayer, EdgeOnLayer>, alignment: MedianAlignmentMode, orderInfo: OrderInfo): KeyNumberMap {
        const nodeInfos = graph.items;
        const positions = this.getNodeToPositionMap(nodeInfos);
        let medians = this.getMedians(graph, nodeInfos, alignment);
        medians = this.resolveMedianConflicts(graph, orderInfo, medians, alignment);
        this.getSortedBlocks(graph, nodeInfos, medians, alignment)
            .forEach(block => {
                const maxPos = block.reduce((acc, n) => positions[n.key] > acc ? positions[n.key] : acc, -2);
                block.forEach(n => {
                    const delta = maxPos - positions[n.key];
                    if(delta > 0)
                        orderInfo[n.layer]
                            .filter(ln => ln.position > n.position)
                            .forEach(ln => positions[ln.key] += delta);

                    positions[n.key] = maxPos;
                });
            });
        return positions;
    }
    private getSortedBlocks(graph: FastGraph<NodeOnLayer>, nodeInfos: NodeOnLayer[], medians: Medians, alignment: MedianAlignmentMode): NodeOnLayer[][] {
        const blocks: NodeOnLayer[][] = [];
        const isBottom = alignment === MedianAlignmentMode.BottomLeft || alignment === MedianAlignmentMode.BottomRight;
        const allNodesInfo = new HashSet<NodeOnLayer>(nodeInfos.slice(0).sort((a, b) => isBottom ? (a.layer - b.layer) : (b.layer - a.layer)), n => n.key);

        while(allNodesInfo.length) {
            const firstNode = allNodesInfo.item(0);
            const block = this.getBlock(graph, firstNode, medians, alignment);
            blocks.push(block);
            block.forEach(n => allNodesInfo.remove(n));
        }
        blocks.sort((x, y) => {
            const xMinNodeInfo = x.reduce((min, n) => n.position < min.position ? n : min, x[0]);
            const yOnMinXLayer = y.filter(n => n.layer === xMinNodeInfo.layer)[0];
            if(yOnMinXLayer)
                return xMinNodeInfo.position > yOnMinXLayer.position ? 1 : -1;
            const yMinNodeInfo = y.reduce((min, n) => n.position < min.position ? n : min, y[0]);
            const xOnMinYLayer = x.filter(n => n.layer === yMinNodeInfo.layer)[0];
            if(xOnMinYLayer)
                return xOnMinYLayer.position > yMinNodeInfo.position ? 1 : -1;
            return xMinNodeInfo.layer > yMinNodeInfo.layer ? 1 : -1;
        });
        return blocks;
    }
    private getBlock(graph: FastGraph<NodeOnLayer>, root: NodeOnLayer, medians: Medians, alignment: MedianAlignmentMode): NodeOnLayer[] {
        const block: NodeOnLayer[] = [];
        let median: EdgeOnLayer = null;
        do {
            if(median)
                root = alignment === MedianAlignmentMode.TopLeft || alignment === MedianAlignmentMode.TopRight ? graph.getNode(median.from) : graph.getNode(median.to);
            block.push(root);
            median = medians[root.key];
        } while(median);
        return block;
    }
    private resolveMedianConflicts(graph: FastGraph<NodeOnLayer>, layers: OrderInfo, medians: Medians, alignment: MedianAlignmentMode): Medians {
        const filteredMedians: Medians = {};
        for(const layer in layers) {
            if(!Object.prototype.hasOwnProperty.call(layers, layer)) continue;

            let minPos: number;
            let maxPos: number;
            let nodeInfos = layers[layer];
            if(alignment === MedianAlignmentMode.TopRight || alignment === MedianAlignmentMode.BottomRight)
                nodeInfos = nodeInfos.slice(0).sort((a, b) => b.position - a.position); 
            nodeInfos.forEach(n => {
                const median = medians[n.key];
                if(!median)
                    filteredMedians[n.key] = null;
                else {
                    const medianItemKey = alignment === MedianAlignmentMode.TopLeft || alignment === MedianAlignmentMode.TopRight ? median.from : median.to;
                    const medianPosition = graph.getNode(medianItemKey).position;
                    if(this.checkMedianConfict(minPos, maxPos, medianPosition, alignment))
                        filteredMedians[n.key] = null;
                    else {
                        minPos = minPos === undefined ? medianPosition : Math.min(minPos, medianPosition);
                        maxPos = maxPos === undefined ? medianPosition : Math.max(maxPos, medianPosition);
                        filteredMedians[n.key] = median;
                    }
                }
            });
        }
        return filteredMedians;
    }
    private checkMedianConfict(min: number, max: number, medianPosition: number, alignment: MedianAlignmentMode): boolean {
        if(min === undefined || max === undefined)
            return false;
        if(alignment === MedianAlignmentMode.TopLeft || alignment === MedianAlignmentMode.BottomLeft)
            return max >= medianPosition;
        return min <= medianPosition;
    }
    private getMedians(graph: FastGraph<NodeOnLayer, EdgeOnLayer>, nodeInfos: NodeOnLayer[], alignment: MedianAlignmentMode): Medians {
        const medians: {[nodeKey: string]: EdgeOnLayer} = {};
        nodeInfos.forEach(n => {
            const actualAdjacentEdges = this.getActualAdjacentEdges(graph, n, alignment);
            const medianPosition = this.getMedianPosition(actualAdjacentEdges.length, alignment);
            medians[n.key] = actualAdjacentEdges[medianPosition];
        });
        return medians;
    }
    getMedianPosition(length: number, alignment: MedianAlignmentMode): number {
        if(length === 0)
            return -1;
        if(length % 2 !== 0)
            return Math.floor(length / 2);
        if(alignment === MedianAlignmentMode.TopLeft || alignment === MedianAlignmentMode.BottomLeft)
            return Math.floor(length / 2) - 1;
        if(alignment === MedianAlignmentMode.TopRight || alignment === MedianAlignmentMode.BottomRight)
            return Math.floor(length / 2);
        throw new Error("Invalid Operation");
    }
    getActualAdjacentEdges(graph: FastGraph<NodeOnLayer, EdgeOnLayer>, node: NodeOnLayer, alignment: MedianAlignmentMode): EdgeOnLayer[] {
        if(alignment === MedianAlignmentMode.TopLeft || alignment === MedianAlignmentMode.TopRight)
            return graph.getAdjacentEdges(node.key, ConnectionMode.Incoming).sort((a, b) => graph.getNode(a.from).position - graph.getNode(b.from).position);
        return graph.getAdjacentEdges(node.key, ConnectionMode.Outgoing).sort((a, b) => graph.getNode(a.to).position - graph.getNode(b.to).position);
    }
}

export class NodeOnLayer implements IHashCodeOwner, IKeyOwner {
    constructor(
        public key: ItemKey,
        public isDummy: boolean,
        public layer: number,
        public position: number
    ) {}
    getHashCode(): string {
        return this.key.toString();
    }
}

export class EdgeOnLayer implements IEdge, IHashCodeOwner {
    getHashCode(): string {
        return this.from + "-" + this.to;
    }
    private _originFrom: ItemKey;
    constructor(
        public key: ItemKey,
        public isDummy: boolean,
        public from: ItemKey,
        public to: ItemKey,
        originFrom?: ItemKey
    ) {
        this._originFrom = originFrom;
    }
    get originFrom(): ItemKey {
        return this._originFrom !== undefined ? this._originFrom : this.from;
    }
}

enum MedianAlignmentMode {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
}

function trunc(val: number) {
    if(Math.trunc)
        return Math.trunc(val);
    if(!isFinite(val)) return val;
    return (val - val % 1) || (val < 0 ? -0 : val === 0 ? val : 0);
}
