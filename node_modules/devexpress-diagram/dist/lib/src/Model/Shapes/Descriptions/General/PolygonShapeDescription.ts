import { ShapeDescription, ShapeDefaultDimension } from "../ShapeDescription";

export abstract class PolygonShapeDescription extends ShapeDescription {
    constructor(hasDefaultText?: boolean) {
        super(undefined, hasDefaultText);
        this.defaultSize.height = this.calculateHeight(ShapeDefaultDimension);
    }

    get keepRatioOnAutoSize() { return true; }
    abstract get angleCount(): number;
    get angle(): number {
        return Math.PI * (this.angleCount - 2) / this.angleCount;
    }
    abstract calculateHeight(width: number): number;
}
