import { ShapeTypes } from "../../ShapeTypes";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeDefaultDimension } from "../ShapeDescription";
import { EllipseShapeDescription } from "../General/EllipseShapeDescription";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitive } from "../../../../Render/Primitives/PathPrimitive";

export class SummingJunctionShapeDescription extends EllipseShapeDescription {
    constructor() {
        super(true);

        this.defaultSize = new Size(ShapeDefaultDimension * 0.5, ShapeDefaultDimension * 0.5);
    }

    get key() { return ShapeTypes.SummingJunction; }
    get keepRatioOnAutoSize(): boolean { return true; }
    get enableText() { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { width, height } = rect;
        const { x: cx, y: cy } = rect.center;
        const rx = width / 2;
        const ry = height / 2;
        const angle = Math.atan(ry / rx);
        const ex = 1 / Math.sqrt(1 / Math.pow(rx, 2) + Math.pow(Math.tan(angle), 2) / Math.pow(ry, 2));
        const ey = ex * Math.tan(angle);

        const primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        return primitives
            .concat(super.createShapePrimitives(shape))
            .concat([
                new PathPrimitive([
                    new PathPrimitiveMoveToCommand(cx - ex, cy - ey),
                    new PathPrimitiveLineToCommand(cx + ex, cy + ey),
                    new PathPrimitiveMoveToCommand(cx - ex, cy + ey),
                    new PathPrimitiveLineToCommand(cx + ex, cy - ey)
                ], shape.style)
            ]);
    }
}
