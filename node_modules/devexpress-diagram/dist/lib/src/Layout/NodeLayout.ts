import { IKeyOwner } from "../Interfaces";
import { ItemKey } from "../Model/DiagramItem";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";

export class NodeInfo implements IKeyOwner {
    constructor(
        public key: ItemKey,
        public margin: Margin,
        public size: Size,
        public connectionPoints: Point[] = []
    ) { }
}
export class NodeLayout implements IKeyOwner {
    constructor(
        public info: NodeInfo,
        public position: Point
    ) { }
    get key(): ItemKey { return this.info.key; }
    get rectangle(): Rectangle {
        return Rectangle.fromGeometry(this.position, this.info.size);
    }
}

export class EdgeLayout implements IKeyOwner {
    constructor(
        public key: ItemKey,
        public beginIndex: number,
        public endIndex: number
    ) {}
}

export class Margin {
    constructor(
        public top: number,
        public right: number = top,
        public bottom: number = top,
        public left: number = top,
    ) { }

    static empty(): Margin {
        return new Margin(0);
    }
}
