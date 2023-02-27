import { ShapeDescription, ShapeDefaultSize } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";

export class DiamondShapeDescription extends ShapeDescription {
    constructor(defaultSize: Size = ShapeDefaultSize.clone(), hasDefaultText?: boolean) {
        super(defaultSize, hasDefaultText);
    }

    get key(): string { return ShapeTypes.Diamond; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;
        const { x: cx, y: cy } = rect.center;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(cx, top),
                new PathPrimitiveLineToCommand(right, cy),
                new PathPrimitiveLineToCommand(cx, bottom),
                new PathPrimitiveLineToCommand(left, cy),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }

    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle.clone().inflate(-shape.size.width / 4, -shape.size.height / 4);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return textSize.clone().multiply(2, 2);
    }
}
