import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveArcToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { EllipsePrimitive } from "../../../../Render/Primitives/EllipsePrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class HardDiskShapeDescription extends RectangleShapeDescription {
    static readonly arcWidthRatio = 0.2;

    constructor() {
        super(undefined, true);
    }

    get key(): string { return ShapeTypes.HardDisk; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width } = rect;
        const cy = rect.center.y;
        const dx = width * HardDiskShapeDescription.arcWidthRatio;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(right - dx / 2, top),
                new PathPrimitiveLineToCommand(left + dx / 2, top),
                new PathPrimitiveArcToCommand(dx / 2, (bottom - top) / 2, 0, false, false, left + dx / 2, bottom),
                new PathPrimitiveLineToCommand(right - dx / 2, bottom),
            ], shape.style),
            new EllipsePrimitive(right - dx / 2, cy, dx / 2, (bottom - top) / 2, shape.style)
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const dx = rect.width * HardDiskShapeDescription.arcWidthRatio * 1.5;
        return rect.clone()
            .resize(-dx - 2 * ShapeTextPadding, -2 * ShapeTextPadding)
            .moveRectangle(ShapeTextPadding, ShapeTextPadding)
            .nonNegativeSize();
    }
    getSizeByText(textSize: Size, shape: Shape): Size {
        return new Size(
            (textSize.width + ShapeTextPadding * 2) / (1 - 1.5 * HardDiskShapeDescription.arcWidthRatio),
            shape.size.height + ShapeTextPadding
        );
    }
}
