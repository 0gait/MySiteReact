import { DiamondShapeDescription } from "../General/DiamondShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeDefaultDimension } from "../ShapeDescription";

export class DecisionShapeDescription extends DiamondShapeDescription {
    constructor() {
        super(new Size(ShapeDefaultDimension, ShapeDefaultDimension * 0.75), true);
    }

    get key() { return ShapeTypes.Decision; }
}
