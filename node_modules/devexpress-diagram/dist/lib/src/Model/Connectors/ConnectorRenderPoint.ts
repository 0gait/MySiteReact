import { Point } from "@devexpress/utils/lib/geometry/point";

export class ConnectorRenderPoint extends Point {
    constructor(x: number, y: number, public pointIndex: number = -1, public skipped: boolean = false) {
        super(x, y);
    }
    offset(offsetX: number, offsetY: number): this {
        super.offset(offsetX, offsetY);
        this.pointIndex = -1;
        this.skipped = false;
        return this;
    }
    multiply(multiplierX: number, multiplierY: number): this {
        super.multiply(multiplierX, multiplierY);
        this.pointIndex = -1;
        this.skipped = false;
        return this;
    }
    clone() { return new ConnectorRenderPoint(this.x, this.y, this.pointIndex, this.skipped); }
}
