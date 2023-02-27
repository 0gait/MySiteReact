import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveArcToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTextPadding } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class DisplayShapeDescription extends RectangleShapeDescription {
    static readonly arcWidthRatio = 0.2;

    constructor() {
        super(undefined, true);
    }

    get key(): string { return ShapeTypes.Display; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width } = rect;
        const cy = rect.center.y;
        const dx = width * DisplayShapeDescription.arcWidthRatio;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(right - dx / 2, top),
                new PathPrimitiveLineToCommand(left + dx / 2, top),
                new PathPrimitiveLineToCommand(left, cy),
                new PathPrimitiveLineToCommand(left + dx / 2, bottom),
                new PathPrimitiveLineToCommand(right - dx / 2, bottom),
                new PathPrimitiveArcToCommand(dx / 2, (bottom - top) / 2, 0, false, false, right - dx / 2, top)
            ], shape.style),
        ];
    }

    getTextRectangle(shape: Shape): Rectangle {
        const dx = shape.size.width * DisplayShapeDescription.arcWidthRatio;
        return shape.rectangle
            .clone()
            .moveRectangle(dx / 2, ShapeTextPadding)
            .resize(-dx, -ShapeTextPadding * 2)
            .nonNegativeSize();
    }
}
