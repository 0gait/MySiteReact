import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand, PathPrimitiveArcToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { GeometryUtils } from "../../../../Utils";
import { ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class DelayShapeDescription extends RectangleShapeDescription {
    static readonly arcWidthRatio = 0.2;

    constructor() {
        super(undefined, true);

        this.defaultSize.width = this.defaultSize.height;
    }

    get key(): string { return ShapeTypes.Delay; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;
        const cx = rect.center.x;

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, top),
                new PathPrimitiveLineToCommand(cx, top),
                new PathPrimitiveArcToCommand((right - left) / 2, (bottom - top) / 2, 0, false, true, cx, bottom),
                new PathPrimitiveLineToCommand(left, bottom),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }

    getTextRectangle(shape: Shape): Rectangle {
        const maxRectInEllipse = GeometryUtils.getMaxRectangleEnscribedInEllipse(shape.size);
        return shape.rectangle.clone().moveRectangle(ShapeTextPadding, ShapeTextPadding)
            .setSize({
                width: maxRectInEllipse.width / 2 + shape.size.width / 2 - ShapeTextPadding,
                height: maxRectInEllipse.height / 2 + shape.size.height / 2 - ShapeTextPadding
            }).nonNegativeSize();
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        const rectByEllipse = GeometryUtils.getEllipseByEnscribedRectangle(textSize);
        return new Size(
            rectByEllipse.width / 2 + textSize.width / 2 + ShapeTextPadding,
            rectByEllipse.height / 2 + textSize.height / 2 + ShapeTextPadding);
    }
}
