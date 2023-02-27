import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";

export class ProcessShapeDescription extends RectangleShapeDescription {
    constructor() {
        super(undefined, true);
    }

    get key(): string { return ShapeTypes.Process; }
    get keepRatioOnAutoSize(): boolean { return false; }
}
