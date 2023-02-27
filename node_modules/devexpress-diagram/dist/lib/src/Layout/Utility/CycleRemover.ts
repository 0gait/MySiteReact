import { Graph } from "../Graph";
import { Edge, ConnectionMode } from "../Structures";
import { ItemsMap } from "../../Model/DiagramItem";
import { HashSet, KeySet } from "../../ListUtils";
import { IKeyOwner } from "../../Interfaces";

export type AcyclicGraphInfo<T extends IKeyOwner> = { graph: Graph<T>, reversedEdges: KeySet, removedEdges: KeySet };

export class CycleRemover {
    static removeCycles<T extends IKeyOwner>(graph: Graph<T>): AcyclicGraphInfo<T> {
        const feedbackSet = this.getFeedbackSet(graph);
        return this.reverseEdges(graph, feedbackSet);
    }

    static getFeedbackSet(graph: Graph<IKeyOwner>): ItemsMap {
        const feedbackSet: ItemsMap = {};
        let nonTrivialStronglyConnectedComponents: Graph<IKeyOwner>[] = this.getNonTrivialStronglyConnectedComponents(graph);
        while(nonTrivialStronglyConnectedComponents.length) {
            nonTrivialStronglyConnectedComponents.forEach(g => {
                const maxCyclicEdges = this.getMaxCyclicEdges(g);
                maxCyclicEdges.forEach(e => delete feedbackSet[e.reverse().getHashKey()]);
                maxCyclicEdges.forEach(e => feedbackSet[e.getHashKey()] = true);
            });
            nonTrivialStronglyConnectedComponents = this.getNonTrivialStronglyConnectedComponents(this.reverseEdges(graph, feedbackSet).graph);
        }
        return feedbackSet;
    }
    static getMaxCyclicEdges(graph: Graph<IKeyOwner>): Edge[] {
        const black: ItemsMap = {};
        const gray: ItemsMap = {};
        const edgeCycleCount: {[key: string]: number} = {};
        const visitedEdges: Edge[] = [];
        const cycles: Edge[][] = [];
        const iterator = graph.createIterator(ConnectionMode.Outgoing);
        iterator.visitEachEdgeOnce = false;
        iterator.onNode = (n) => {
            gray[n.key] = true;
        };
        iterator.skipNode = (n) => {
            if(gray[n.key]) {
                const cycle: Edge[] = [];
                for(let i = 0; i < visitedEdges.length; i++) {
                    const e = visitedEdges[i];
                    if(edgeCycleCount[e.key] === undefined)
                        edgeCycleCount[e.key] = 0;
                    edgeCycleCount[e.key]++;
                    cycle.push(e);
                    if(e.from === n.key)
                        break;
                }
                cycles.push(cycle);
            }
            return gray[n.key] || black[n.key];
        };
        iterator.skipEdge = (e) => false;
        iterator.onEdge = (e) => {
            visitedEdges.splice(0, 0, e);
        };
        iterator.onAfterEdge = (e) => {
            visitedEdges.splice(0, 1);
        };
        iterator.onAllEdges = (e) => {
            black[e.key] = true;
            gray[e.key] = false;
        };
        iterator.iterate(graph.nodes[0]);
        const edgeSet = new HashSet<Edge>([], e => e.key);
        cycles.forEach(c => {
            edgeSet.tryPush(c.reduce((max, curr) => edgeCycleCount[curr.key] > edgeCycleCount[max.key] ? curr : max, c[0]));
        });
        return edgeSet.list();
    }

    private static reverseEdges<T extends IKeyOwner>(graph: Graph<T>, feedbackSet: ItemsMap): AcyclicGraphInfo<T> {
        const edges = new HashSet<Edge>([], e => e.getHashKey());
        const reversedEdges: KeySet = {};
        const removedEdges: KeySet = {};
        graph.edges.forEach(e => {
            if(feedbackSet[e.getHashKey()]) {
                e = e.reverse();
                reversedEdges[e.key] = true;
            }
            if(!edges.tryPush(e)) {
                removedEdges[e.key] = true;
                delete reversedEdges[e.key];
            }
        });
        return {
            graph: new Graph(graph.nodes.map(n => graph.getNode(n)), edges.list()),
            reversedEdges: reversedEdges,
            removedEdges: removedEdges
        };
    }

    private static getNonTrivialStronglyConnectedComponents(graph: Graph<IKeyOwner>): Graph<IKeyOwner>[] {
        return this.getStronglyConnectedComponents(graph).filter(g => g.edges.length);
    }

    static getStronglyConnectedComponents(graph: Graph<IKeyOwner>): Graph<IKeyOwner>[] {
        const nodesStack: IKeyOwner[] = [];
        let index = 0;
        const lowIndex: {[nodeKey: string]: number} = {};
        const lowLink: {[nodeKey: string]: number} = {};
        const onStack: ItemsMap = {};
        const components: Graph<IKeyOwner>[] = [];
        const visitedNodes: KeySet = {};
        for(let i = 0; i < graph.nodes.length; i++) {
            const nodeKey = graph.nodes[i];
            const iterator = graph.createIterator(ConnectionMode.Outgoing);
            iterator.visitEachEdgeOnce = false;
            iterator.visitEachNodeOnce = false;
            iterator.onNode = (n) => {
                visitedNodes[n.key] = true;
                nodesStack.push(n);
                onStack[n.key] = true;
                lowLink[n.key] = index;
                lowIndex[n.key] = index;
                index++;
            };
            iterator.skipNode = (n) => visitedNodes[n.key];
            iterator.skipEdge = (e) => {
                const isVisited = visitedNodes[e.to];
                if(isVisited && onStack[e.to])
                    lowLink[e.from] = Math.min(lowLink[e.from], lowIndex[e.to]);
                return isVisited;
            };
            iterator.onAfterEdge = (e) => {
                lowLink[e.from] = Math.min(lowLink[e.from], lowLink[e.to]);
            };
            iterator.onAllEdges = (n, outgoing) => {
                if(outgoing && lowLink[n.key] === lowIndex[n.key])
                    components.push(this.getStronglyConnectedComponent(graph, n, nodesStack, onStack));
            };
            iterator.iterate(nodeKey);
        }
        return components;
    }

    private static getStronglyConnectedComponent(graph: Graph<IKeyOwner>, root: IKeyOwner, nodesStack: IKeyOwner[], onStack: ItemsMap): Graph<IKeyOwner> {
        const itemsMap: KeySet = {};
        const nodes: IKeyOwner[] = [];
        let edges: Edge[] = [];
        let topStackNode: IKeyOwner;
        do {
            topStackNode = nodesStack.pop();
            if(!itemsMap[topStackNode.key])
                nodes.push(topStackNode);
            itemsMap[topStackNode.key] = true;
            onStack[topStackNode.key] = false;
        } while(topStackNode !== root);
        nodes.forEach(n => {
            const aEdges = graph.getAdjacentEdges(n.key, ConnectionMode.Outgoing);
            edges = edges.concat(aEdges.filter(e => !itemsMap[e.key] && itemsMap[e.to]));
            aEdges.forEach(e => itemsMap[e.key] = true);
        });
        return new Graph(nodes, edges);
    }
}
