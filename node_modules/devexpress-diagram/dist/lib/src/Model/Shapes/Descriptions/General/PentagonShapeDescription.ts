import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { PolygonShapeDescription } from "./PolygonShapeDescription";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { GeometryUtils } from "../../../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class PentagonShapeDescription extends PolygonShapeDescription {
    private defaultRatio: number;

    constructor(hasDefaultText?: boolean) {
        super(hasDefaultText);

        this.defaultRatio = this.defaultSize.height / this.defaultSize.width;
    }

    get key(): string { return ShapeTypes.Pentagon; }
    get angleCount(): number { return 5; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width, height } = rect;
        const cx = rect.center.x;
        const ratio = height / width / this.defaultRatio;
        const angle = Math.PI - this.angle;
        const py = width / 2 * Math.tan(angle / 2) * ratio;
        const y = top + py;
        const px = (height - py) / Math.tan(angle) / ratio;
        const x1 = left + px;
        const x2 = right - px;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(cx, top),
                new PathPrimitiveLineToCommand(right, y),
                new PathPrimitiveLineToCommand(x2, bottom),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveLineToCommand(left, y),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint): void {
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.East || side === ConnectionPointSide.West) {
            const rect = shape.rectangle;
            const { y: top, width, height } = rect;
            const ratio = height / width / this.defaultRatio;
            const angle = Math.PI - this.angle;
            const py = width / 2 * Math.tan(angle / 2) * ratio;
            const y = top + py;

            if(side === ConnectionPointSide.East)
                point.y = y;
            else if(side === ConnectionPointSide.West)
                point.y = y;
        }
    }
    calculateHeight(width: number): number {
        const angle = Math.PI - this.angle;
        const h1 = width / 2 * Math.tan(angle / 2);
        const side = width / 2 / Math.cos(angle / 2);
        const h2 = side * Math.sin(angle);
        return h1 + h2;
    }
    getTextRectangle(shape: Shape): Rectangle {
        const textSize = GeometryUtils.getMaxRectangleEnscribedInEllipse(shape.size);
        return Rectangle.fromGeometry(shape.position.clone().offset((shape.size.width - textSize.width) / 2, (shape.size.height - textSize.height) / 2), textSize);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return GeometryUtils.getEllipseByEnscribedRectangle(textSize);
    }
}
