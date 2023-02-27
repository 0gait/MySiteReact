import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveArcToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { EllipsePrimitive } from "../../../../Render/Primitives/EllipsePrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class DatabaseShapeDescription extends RectangleShapeDescription {
    static readonly arcWidthRatio = 0.2;

    constructor() {
        super(undefined, true);

        this.defaultSize.width = this.defaultSize.height;
    }

    get key() { return ShapeTypes.Database; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, height } = rect;
        const cx = rect.center.x;
        const dy = height * DatabaseShapeDescription.arcWidthRatio;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(right, top + dy / 2),
                new PathPrimitiveLineToCommand(right, bottom - dy / 2),
                new PathPrimitiveArcToCommand((right - left) / 2, dy / 2, 0, false, true, left, bottom - dy / 2),
                new PathPrimitiveLineToCommand(left, top + dy / 2),
            ], shape.style),
            new EllipsePrimitive(cx, top + dy / 2, (right - left) / 2, dy / 2, shape.style)
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const dy = rect.height * DatabaseShapeDescription.arcWidthRatio;
        return rect.clone().resize(0, -dy).clone().moveRectangle(0, dy);
    }
}
