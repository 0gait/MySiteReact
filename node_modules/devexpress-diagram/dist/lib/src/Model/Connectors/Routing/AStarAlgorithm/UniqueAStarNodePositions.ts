import { AStarNode } from "./AStarNode";

export class UniqueAStarNodePositions<T> {
    private items: { [key: string]: { position: T, node: AStarNode<T> } } = {};

    constructor(private getKey: (key: T) => string = (key) => key.toString()) { }

    get count(): number { return Object.keys(this.items).length; }

    getNode(position: T): AStarNode<T> {
        const item = this.items[this.getKey(position)];
        return item !== undefined ? item.node : undefined;
    }
    add(position: T, node: AStarNode<T>): void {
        const key = this.getKey(position);
        if(this.items[key] === undefined)
            this.items[key] = { position, node };
    }
    remove(position: T): void {
        const key = this.getKey(position);
        if(this.items[key] !== undefined)
            delete this.items[key];
    }
}
