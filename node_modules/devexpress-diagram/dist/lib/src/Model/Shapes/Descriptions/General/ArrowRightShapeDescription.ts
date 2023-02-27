import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ArrowHorizontalShapeDescription, ArrowVerticalTriangleWidthParameterName, ArrowVerticalLineHeightParameterName } from "./ArrowHorizontalShapeDescription";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ShapeParameters } from "../../ShapeParameters";
import { ShapeTypes } from "../../ShapeTypes";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";

export class ArrowRightShapeDescription extends ArrowHorizontalShapeDescription {
    get key() { return ShapeTypes.ArrowRight; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width, height } = rect;
        const cy = rect.center.y;
        const p0dx = width - shape.parameters.get(ArrowVerticalTriangleWidthParameterName).value;
        const p1dy = (height - shape.parameters.get(ArrowVerticalLineHeightParameterName).value) / 2;

        const p0x1 = shape.normalizeX(left + p0dx);
        const p1y1 = shape.normalizeY(top + p1dy);
        const p1y2 = shape.normalizeY(bottom - p1dy);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, p1y1),
                new PathPrimitiveLineToCommand(p0x1, p1y1),
                new PathPrimitiveLineToCommand(p0x1, top),
                new PathPrimitiveLineToCommand(right, cy),
                new PathPrimitiveLineToCommand(p0x1, bottom),
                new PathPrimitiveLineToCommand(p0x1, p1y2),
                new PathPrimitiveLineToCommand(left, p1y2),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleWidthParameterName, p => p.value - deltaX);
        this.changeParameterValue(parameters, ArrowVerticalLineHeightParameterName, p => p.value - deltaY * 2);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        return [
            new ShapeParameterPoint("c",
                new Point(
                    shape.normalizeX(shape.position.x + shape.size.width - shape.parameters.get(ArrowVerticalTriangleWidthParameterName).value),
                    shape.normalizeY(shape.position.y + (shape.size.height - shape.parameters.get(ArrowVerticalLineHeightParameterName).value) / 2)
                )
            )
        ];
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        const triangleWidth = shape.parameters.get(ArrowVerticalTriangleWidthParameterName).value;
        if(point.x > shape.position.x + shape.size.width - triangleWidth) {
            const tg = shape.size.height / 2 / triangleWidth;
            const delta = (point.x - (shape.position.x + shape.size.width - triangleWidth)) * tg;
            const side = shape.getConnectionPointSide(point);
            if(side === ConnectionPointSide.North)
                point.y += delta;
            else if(side === ConnectionPointSide.South)
                point.y -= delta;
        }
        else
            super.processConnectionPoint(shape, point);
    }
}
