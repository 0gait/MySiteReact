import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveArcToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class StoredDataShapeDescription extends RectangleShapeDescription {
    static readonly arcWidthRatio = 0.2;

    constructor() {
        super(undefined, true);
    }

    get key(): string { return ShapeTypes.StoredData; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width } = rect;
        const dx = width * StoredDataShapeDescription.arcWidthRatio;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(right, top),
                new PathPrimitiveLineToCommand(left + dx / 2, top),
                new PathPrimitiveArcToCommand(dx / 2, (bottom - top) / 2, 0, false, false, left + dx / 2, bottom),
                new PathPrimitiveLineToCommand(right, bottom),
                new PathPrimitiveArcToCommand(dx / 2, (bottom - top) / 2, 0, false, true, right, top)
            ], shape.style)
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const dx = rect.width * StoredDataShapeDescription.arcWidthRatio / 2;
        return rect.clone()
            .resize(-dx - 2 * ShapeTextPadding, -2 * ShapeTextPadding)
            .moveRectangle(ShapeTextPadding, ShapeTextPadding)
            .nonNegativeSize();
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return new Size(
            (textSize.width + 2 * ShapeTextPadding) / (1 - StoredDataShapeDescription.arcWidthRatio / 2),
            textSize.height + 2 * ShapeTextPadding);
    }
}
