import { Point } from "@devexpress/utils/lib/geometry/point";
import { ConnectionPointSide } from "./DiagramItem";

export class ConnectionPoint extends Point {
    constructor(x: number, y: number, public side: ConnectionPointSide = ConnectionPointSide.Undefined) {
        super(x, y);
    }
    offset(offsetX: number, offsetY: number): this {
        super.offset(offsetX, offsetY);
        this.side = ConnectionPointSide.Undefined;
        return this;
    }
    multiply(multiplierX: number, multiplierY: number): this {
        super.multiply(multiplierX, multiplierY);
        this.side = ConnectionPointSide.Undefined;
        return this;
    }

    clone() { return new ConnectionPoint(this.x, this.y, this.side); }
    toPoint() { return new Point(this.x, this.y); }
}
