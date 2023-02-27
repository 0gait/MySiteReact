import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { ShapeTextPadding } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class ManualInputShapeDescription extends RectangleShapeDescription {
    static readonly slopeHeightRatio = 0.1;

    constructor() {
        super(undefined, true);
    }

    get key(): string { return ShapeTypes.ManualInput; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, right, bottom, height } = shape.rectangle;
        const y1 = top + height * ManualInputShapeDescription.slopeHeightRatio;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, y1),
                new PathPrimitiveLineToCommand(right, top),
                new PathPrimitiveLineToCommand(right, bottom),
                new PathPrimitiveLineToCommand(left, bottom),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint): void {
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.North)
            point.y += ManualInputShapeDescription.slopeHeightRatio / 2 * shape.size.height;
    }

    getTextRectangle(shape: Shape): Rectangle {
        const yOffset = shape.size.height * ManualInputShapeDescription.slopeHeightRatio;
        return shape.rectangle.clone()
            .moveRectangle(ShapeTextPadding, yOffset)
            .resize(-ShapeTextPadding * 2, -yOffset - ShapeTextPadding)
            .nonNegativeSize();
    }
}
