import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ArrowHorizontalShapeDescription, ArrowVerticalTriangleWidthParameterName, ArrowVerticalLineHeightParameterName } from "./ArrowHorizontalShapeDescription";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ShapeParameters } from "../../ShapeParameters";
import { ShapeTypes } from "../../ShapeTypes";

export class ArrowLeftRightShapeDescription extends ArrowHorizontalShapeDescription {
    get key() { return ShapeTypes.ArrowLeftRight; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, height } = rect;
        const cy = rect.center.y;
        const p0dx = shape.parameters.get(ArrowVerticalTriangleWidthParameterName).value;
        const p1dy = (height - shape.parameters.get(ArrowVerticalLineHeightParameterName).value) / 2;

        const p0x1 = shape.normalizeX(left + p0dx);
        const p1y1 = shape.normalizeY(top + p1dy);
        const p0x2 = shape.normalizeX(right - p0dx);
        const p1y2 = shape.normalizeY(bottom - p1dy);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, cy),
                new PathPrimitiveLineToCommand(p0x1, top),
                new PathPrimitiveLineToCommand(p0x1, p1y1),
                new PathPrimitiveLineToCommand(p0x2, p1y1),
                new PathPrimitiveLineToCommand(p0x2, top),
                new PathPrimitiveLineToCommand(right, cy),
                new PathPrimitiveLineToCommand(p0x2, bottom),
                new PathPrimitiveLineToCommand(p0x2, p1y2),
                new PathPrimitiveLineToCommand(p0x1, p1y2),
                new PathPrimitiveLineToCommand(p0x1, bottom),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleWidthParameterName,
            p => Math.max(0, Math.min(shape.size.width / 2 - 2 * shape.strokeWidth, p.value)));
        this.changeParameterValue(parameters, ArrowVerticalLineHeightParameterName,
            p => Math.max(0, Math.min(shape.size.height, p.value)));
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleWidthParameterName, p => p.value + deltaX);
        this.changeParameterValue(parameters, ArrowVerticalLineHeightParameterName, p => p.value - deltaY * 2);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        return [
            new ShapeParameterPoint("c",
                new Point(
                    shape.normalizeX(shape.position.x + shape.parameters.get(ArrowVerticalTriangleWidthParameterName).value),
                    shape.normalizeY(shape.position.y + (shape.size.height - shape.parameters.get(ArrowVerticalLineHeightParameterName).value) / 2)
                )
            )
        ];
    }
}
