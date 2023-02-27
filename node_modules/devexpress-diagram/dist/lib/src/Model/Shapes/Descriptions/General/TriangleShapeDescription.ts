import { ShapeDescription, ShapeDefaultDimension, ShapeTextPadding } from "../ShapeDescription";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { ConnectionPointSide } from "../../../DiagramItem";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class TriangleShapeDescription extends ShapeDescription {
    constructor(hasDefaultText?: boolean) {
        super(undefined, hasDefaultText);

        this.defaultSize.height = this.calculateHeight(ShapeDefaultDimension);
    }

    get key(): string { return ShapeTypes.Triangle; }
    get keepRatioOnAutoSize(): boolean { return false; }

    protected createConnectionPoints(): ConnectionPoint[] {
        return [
            new ConnectionPoint(0.5, 0, ConnectionPointSide.North),
            new ConnectionPoint(0.75, 0.5, ConnectionPointSide.East),
            new ConnectionPoint(0.5, 1, ConnectionPointSide.South),
            new ConnectionPoint(0.25, 0.5, ConnectionPointSide.West)
        ];
    }
    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(rect.center.x, top),
                new PathPrimitiveLineToCommand(right, bottom),
                new PathPrimitiveLineToCommand(left, bottom),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    protected calculateHeight(width: number): number {
        return Math.sqrt(Math.pow(width, 2) - Math.pow(width / 2, 2));
    }
    getTextRectangle(shape: Shape): Rectangle {
        return new Rectangle(shape.position.x + shape.size.width / 4, shape.position.y + shape.size.height / 2, shape.size.width / 2, shape.size.height / 2 - ShapeTextPadding)
            .nonNegativeSize();
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return new Size(textSize.width * 2, textSize.height * 2 + ShapeTextPadding);
    }
}
