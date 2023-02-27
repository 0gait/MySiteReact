import { ShapeTypes } from "../../ShapeTypes";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeDefaultDimension } from "../ShapeDescription";
import { EllipseShapeDescription } from "../General/EllipseShapeDescription";

export class ConnectorShapeDescription extends EllipseShapeDescription {
    constructor() {
        super(false);

        this.defaultSize = new Size(ShapeDefaultDimension * 0.5, ShapeDefaultDimension * 0.5);
    }

    get key() { return ShapeTypes.Connector; }
    get keepRatioOnAutoSize(): boolean { return true; }
}
