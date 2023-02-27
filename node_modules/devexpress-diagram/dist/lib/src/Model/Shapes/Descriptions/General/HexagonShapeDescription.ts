import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { PolygonShapeDescription } from "./PolygonShapeDescription";
import { GeometryUtils } from "../../../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class HexagonShapeDescription extends PolygonShapeDescription {
    get key(): string { return ShapeTypes.Hexagon; }
    get angleCount(): number { return 6; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width } = rect;
        const cy = rect.center.y;
        const angle = Math.PI - this.angle;
        const sideX = width / (1 + 2 * Math.cos(angle));
        const x1 = left + (width - sideX) / 2;
        const x2 = x1 + sideX;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(x1, top),
                new PathPrimitiveLineToCommand(x2, top),
                new PathPrimitiveLineToCommand(right, cy),
                new PathPrimitiveLineToCommand(x2, bottom),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveLineToCommand(left, cy),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    calculateHeight(width: number): number {
        const angle = Math.PI - this.angle;
        const sideX = width / (1 + 2 * Math.cos(angle));
        return 2 * sideX * Math.sin(angle);
    }
    getTextRectangle(shape: Shape): Rectangle {
        const textSize = GeometryUtils.getMaxRectangleEnscribedInEllipse(shape.size);
        return Rectangle.fromGeometry(shape.position.clone().offset((shape.size.width - textSize.width) / 2, (shape.size.height - textSize.height) / 2), textSize);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return GeometryUtils.getEllipseByEnscribedRectangle(textSize);
    }
}
