import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { ShapeTextPadding } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class ManualOperationShapeDescription extends RectangleShapeDescription {
    static readonly slopeAngle = 81 * Math.PI / 180;

    constructor() {
        super(undefined, true);
    }

    get key(): string { return ShapeTypes.ManualOperation; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width, height } = shape.rectangle;
        const px = Math.min(Math.max(0, height / Math.tan(ManualOperationShapeDescription.slopeAngle)), width);
        const cx = rect.center.x;
        const x1 = Math.min(left + px, cx);
        const x2 = Math.max(right - px, cx);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, top),
                new PathPrimitiveLineToCommand(right, top),
                new PathPrimitiveLineToCommand(x2, bottom),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        const offset = shape.size.height / Math.tan(ManualOperationShapeDescription.slopeAngle);
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.East)
            point.x -= offset / 2;
        else if(side === ConnectionPointSide.West)
            point.x += offset / 2;
    }
    getTextRectangle(shape: Shape): Rectangle {
        const px = Math.min(Math.max(0, shape.size.height / Math.tan(ManualOperationShapeDescription.slopeAngle)), shape.size.width);
        return shape.rectangle.clone()
            .moveRectangle(px, ShapeTextPadding)
            .resize(-px * 2, -ShapeTextPadding * 2)
            .nonNegativeSize();
    }
}
