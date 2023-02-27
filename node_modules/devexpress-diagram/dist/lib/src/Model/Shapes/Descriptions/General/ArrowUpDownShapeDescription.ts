import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ArrowVerticalShapeDescription, ArrowVerticalTriangleHeightParameterName, ArrowVerticalLineWidthParameterName } from "./ArrowVerticalShapeDescription";
import { ShapeParameters } from "../../ShapeParameters";
import { ShapeTypes } from "../../ShapeTypes";

export class ArrowUpDownShapeDescription extends ArrowVerticalShapeDescription {
    get key() { return ShapeTypes.ArrowUpDown; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width } = rect;
        const cx = rect.center.x;
        const p1dx = (width - shape.parameters.get(ArrowVerticalLineWidthParameterName).value) / 2;
        const p0dy = shape.parameters.get(ArrowVerticalTriangleHeightParameterName).value;

        const p1x1 = shape.normalizeX(left + p1dx);
        const p0y1 = shape.normalizeY(top + p0dy);
        const p1x2 = shape.normalizeX(right - p1dx);
        const p0y2 = shape.normalizeY(bottom - p0dy);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(cx, top),
                new PathPrimitiveLineToCommand(right, p0y1),
                new PathPrimitiveLineToCommand(p1x2, p0y1),
                new PathPrimitiveLineToCommand(p1x2, p0y2),
                new PathPrimitiveLineToCommand(right, p0y2),
                new PathPrimitiveLineToCommand(cx, bottom),
                new PathPrimitiveLineToCommand(left, p0y2),
                new PathPrimitiveLineToCommand(p1x1, p0y2),
                new PathPrimitiveLineToCommand(p1x1, p0y1),
                new PathPrimitiveLineToCommand(left, p0y1),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleHeightParameterName,
            p => Math.max(0, Math.min(shape.size.height / 2 - 2 * shape.strokeWidth, p.value)));
        this.changeParameterValue(parameters, ArrowVerticalLineWidthParameterName,
            p => Math.max(0, Math.min(shape.size.width, p.value)));
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleHeightParameterName, p => p.value + deltaY);
        this.changeParameterValue(parameters, ArrowVerticalLineWidthParameterName, p => p.value - deltaX * 2);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        return [
            new ShapeParameterPoint("c",
                new Point(
                    shape.normalizeX(shape.position.x + (shape.size.width - shape.parameters.get(ArrowVerticalLineWidthParameterName).value) / 2),
                    shape.normalizeY(shape.position.y + shape.parameters.get(ArrowVerticalTriangleHeightParameterName).value)
                )
            )
        ];
    }
}
