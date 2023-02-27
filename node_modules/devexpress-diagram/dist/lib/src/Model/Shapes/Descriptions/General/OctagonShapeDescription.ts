import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { PolygonShapeDescription } from "./PolygonShapeDescription";
import { GeometryUtils } from "../../../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class OctagonShapeDescription extends PolygonShapeDescription {
    get key(): string { return ShapeTypes.Octagon; }
    get angleCount(): number { return 8; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width, height } = rect;
        const angle = Math.PI - this.angle;
        const sideX = width / (1 + 2 * Math.cos(angle));
        const sideY = height / (1 + 2 * Math.cos(angle));
        const x1 = left + (width - sideX) / 2;
        const x2 = x1 + sideX;
        const y1 = top + (height - sideY) / 2;
        const y2 = y1 + sideY;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(x1, top),
                new PathPrimitiveLineToCommand(x2, top),
                new PathPrimitiveLineToCommand(right, y1),
                new PathPrimitiveLineToCommand(right, y2),
                new PathPrimitiveLineToCommand(x2, bottom),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveLineToCommand(left, y2),
                new PathPrimitiveLineToCommand(left, y1),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    calculateHeight(width: number): number {
        return width;
    }
    getTextRectangle(shape: Shape): Rectangle {
        const textSize = GeometryUtils.getMaxRectangleEnscribedInEllipse(shape.size);
        return Rectangle.fromGeometry(shape.position.clone().offset((shape.size.width - textSize.width) / 2, (shape.size.height - textSize.height) / 2), textSize);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return GeometryUtils.getEllipseByEnscribedRectangle(textSize);
    }
}
