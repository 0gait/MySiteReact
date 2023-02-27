import { ItemKey } from "../Model/DiagramItem";
import { IKeyOwner } from "../Interfaces";
import { IEdge } from "./Graph";

export class Edge implements IEdge {
    constructor(key: ItemKey, from: ItemKey, to: ItemKey, weight: number = 1) {
        this.weight = weight;
        this.key = key;
        this.from = from;
        this.to = to;
    }
    from: ItemKey;
    to: ItemKey;
    weight: number;
    key: ItemKey;
    getHashKey(): string {
        return this.from + "_" + this.to;
    }
    reverse(): Edge {
        return new Edge(this.key, this.to, this.from, this.weight);
    }
}

export class PositionInfo<T extends IKeyOwner> {
    constructor(public item: T, public position: Position) { }
}


export enum ConnectionMode {
    Outgoing = 1,
    Incoming = 2,
    OutgoingAndIncoming = 1 | 2,
}
