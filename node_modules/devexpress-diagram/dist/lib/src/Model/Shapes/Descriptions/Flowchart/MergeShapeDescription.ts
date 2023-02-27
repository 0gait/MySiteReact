import { ShapeTypes } from "../../ShapeTypes";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { TriangleShapeDescription } from "../General/TriangleShapeDescription";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class MergeShapeDescription extends TriangleShapeDescription {
    constructor() {
        super(true);
    }

    get key(): string { return ShapeTypes.Merge; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, top),
                new PathPrimitiveLineToCommand(right, top),
                new PathPrimitiveLineToCommand(rect.center.x, bottom),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    protected calculateHeight(width: number): number {
        return width * 0.75;
    }
    getTextRectangle(shape: Shape): Rectangle {
        return Rectangle.fromGeometry(shape.position.clone().offset(shape.size.width / 4, ShapeTextPadding), new Size(shape.size.width / 2, shape.size.height / 2 - ShapeTextPadding));
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return new Size(textSize.width * 2, (textSize.height + ShapeTextPadding) * 2);
    }
}
