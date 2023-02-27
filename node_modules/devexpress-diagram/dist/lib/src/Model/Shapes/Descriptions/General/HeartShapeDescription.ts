import { ShapeDescription, ShapeTextPadding } from "../ShapeDescription";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand, PathPrimitiveCubicCurveToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { ConnectionPointSide } from "../../../DiagramItem";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class HeartShapeDescription extends ShapeDescription {
    get key(): string { return ShapeTypes.Heart; }
    get keepRatioOnAutoSize(): boolean { return true; }
    protected createConnectionPoints(): ConnectionPoint[] {
        return [
            new ConnectionPoint(0.5, 0.15, ConnectionPointSide.North),
            new ConnectionPoint(1, 0.25, ConnectionPointSide.East),
            new ConnectionPoint(0.5, 1, ConnectionPointSide.South),
            new ConnectionPoint(0, 0.25, ConnectionPointSide.West)
        ];
    }
    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width, height } = rect;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(right - width * 0.25, top),
                new PathPrimitiveCubicCurveToCommand(
                    right - width * 0.15, top,
                    right, top + height * 0.1,
                    right, top + height * 0.25),
                new PathPrimitiveCubicCurveToCommand(
                    right, top + height * 0.3,
                    right - width * 0.02, top + height * 0.35,
                    right - width * 0.05, top + height * 0.4),
                new PathPrimitiveLineToCommand(rect.center.x, bottom),
                new PathPrimitiveLineToCommand(left + width * 0.05, top + height * 0.4),
                new PathPrimitiveCubicCurveToCommand(
                    left + width * 0.02, top + height * 0.35,
                    left, top + height * 0.3,
                    left, top + height * 0.25),
                new PathPrimitiveCubicCurveToCommand(
                    left, top + height * 0.1,
                    left + width * 0.15, top,
                    left + width * 0.25, top),
                new PathPrimitiveCubicCurveToCommand(
                    left + width * 0.3, top,
                    left + width * 0.45, top + height * 0.03,
                    left + width * 0.5, top + height * 0.15),
                new PathPrimitiveCubicCurveToCommand(
                    right - width * 0.45, top + height * 0.03,
                    right - width * 0.3, top,
                    right - width * 0.25, top),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle.clone().inflate(-ShapeTextPadding, -ShapeTextPadding);
    }
    getSizeByText(_textSize: Size, shape: Shape): Size {
        return shape.size.clone().offset(ShapeTextPadding * 2, ShapeTextPadding * 2);
    }
}
