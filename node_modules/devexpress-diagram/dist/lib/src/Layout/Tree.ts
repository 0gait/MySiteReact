import { IKeyOwner } from "../Interfaces";
import { Graph } from "./Graph";
import { ConnectionMode } from "./Structures";
import { ItemKey } from "../Model/DiagramItem";

export class Tree<T extends IKeyOwner> {
    private parentToChildren: {[parentKey: string]: T[]};
    private childToParent: {[childKey: string]: ItemKey} = {};
    root: T;
    constructor(root: T, parentToChildren: {[parentKey: string]: T[]}) {
        this.root = root;
        this.parentToChildren = parentToChildren;
        for(const key in parentToChildren) {
            if(!Object.prototype.hasOwnProperty.call(parentToChildren, key)) continue;
            parentToChildren[key].forEach(c => this.childToParent[c.key] = key);
        }
    }
    getChildren(node: T): T[] {
        return node && this.parentToChildren[node.key] ? this.parentToChildren[node.key] : [];
    }
    hasChildren(node: T): boolean {
        return this.parentToChildren[node.key] && this.parentToChildren[node.key].length > 0;
    }
    iterate(callback: (node: T, level: number) => void) {
        this.iterateCore(this.root, 0, callback);
    }
    static createSpanningTree<T extends IKeyOwner>(component: Graph<T>): Tree<T> {
        const rootKey = Tree.findRoot(component);
        const iterator = component.createIterator(ConnectionMode.Outgoing);
        const parentToChildren: { [parentKey: string]: T[] } = {};
        iterator.skipEdge = (e => e.to === undefined || iterator.isNodeVisited(e.to));
        iterator.onNode = n => parentToChildren[n.key] = [];
        iterator.onEdge = e => {
            const node = component.getNode(e.to);
            node && parentToChildren[e.from].push(node);
        };
        iterator.iterate(rootKey);
        return new Tree(component.getNode(rootKey), parentToChildren);
    }

    private iterateCore(node: T, level: number, callback: (node: T, level: number) => void) {
        callback(node, level);
        this.getChildren(node).forEach(n => this.iterateCore(n, level + 1, callback));
    }
    private static findRoot<T extends IKeyOwner>(component: Graph<T>): ItemKey {
        return component.nodes.reduce<{inc: number, out: number, candidate: ItemKey}>((aggregator, cur) => {
            const edges = component.getAdjacentEdges(cur);
            const inc = edges.filter(l => l.to === cur).length;
            const out = edges.filter(l => l.from === cur).length;
            if(aggregator.candidate === undefined || (inc === 0 && aggregator.inc > 0) || (aggregator.inc !== 0 && aggregator.out - aggregator.inc < out - inc)) {
                aggregator.candidate = cur;
                aggregator.inc = inc;
                aggregator.out = out;
            }
            return aggregator;
        }, { inc: -1, out: -1, candidate: undefined }).candidate;
    }
}
