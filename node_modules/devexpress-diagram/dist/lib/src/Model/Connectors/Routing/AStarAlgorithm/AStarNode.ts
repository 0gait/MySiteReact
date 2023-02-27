
export class AStarNode<T> {
    public penalty: number;
    public parent: AStarNode<T>;

    constructor(public position: T, public readonly distance: number) {
        this.penalty = 0;
    }

    get key() : number { return this.distance + this.penalty; }

    getPath(): T[] {
        const result = [];
        let currentNode: AStarNode<T> = this;
        while(currentNode !== undefined) {
            result.splice(0, 0, currentNode.position);
            currentNode = currentNode.parent;
        }
        return result;
    }
}
