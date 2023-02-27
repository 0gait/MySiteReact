import { ShapeTypes } from "../../ShapeTypes";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeDefaultDimension } from "../ShapeDescription";
import { EllipseShapeDescription } from "../General/EllipseShapeDescription";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitive } from "../../../../Render/Primitives/PathPrimitive";

export class OrShapeDescription extends EllipseShapeDescription {
    constructor() {
        super(true);

        this.defaultSize = new Size(ShapeDefaultDimension * 0.5, ShapeDefaultDimension * 0.5);
    }

    get key() { return ShapeTypes.Or; }
    get keepRatioOnAutoSize(): boolean { return true; }
    get enableText() { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;
        const { x: cx, y: cy } = rect.center;

        const primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        return primitives
            .concat(super.createShapePrimitives(shape))
            .concat([
                new PathPrimitive([
                    new PathPrimitiveMoveToCommand(cx, top),
                    new PathPrimitiveLineToCommand(cx, bottom),
                    new PathPrimitiveMoveToCommand(left, cy),
                    new PathPrimitiveLineToCommand(right, cy)
                ], shape.style)
            ]);
    }
}
