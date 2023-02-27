import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand, PathPrimitiveQuadraticCurveToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeDefaultDimension } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { GeometryUtils } from "../../../../Utils";

export class TerminatorShapeDescription extends RectangleShapeDescription {
    static readonly curveWidthRatio = 0.3;

    constructor() {
        super(new Size(ShapeDefaultDimension, ShapeDefaultDimension * 0.5), true);
    }

    get key(): string { return ShapeTypes.Terminator; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width } = rect;
        const cy = rect.center.y;
        const x1 = left + width * TerminatorShapeDescription.curveWidthRatio;
        const x2 = left + width * (1 - TerminatorShapeDescription.curveWidthRatio);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(x1, top),
                new PathPrimitiveLineToCommand(x2, top),
                new PathPrimitiveQuadraticCurveToCommand(right, top, right, cy),
                new PathPrimitiveQuadraticCurveToCommand(right, bottom, x2, bottom),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveQuadraticCurveToCommand(left, bottom, left, cy),
                new PathPrimitiveQuadraticCurveToCommand(left, top, x1, top),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }

    getTextRectangle(shape: Shape): Rectangle {
        const textSize = GeometryUtils.getMaxRectangleEnscribedInEllipse(shape.size);
        return Rectangle.fromGeometry(shape.position.clone().offset((shape.size.width - textSize.width) / 2, (shape.size.height - textSize.height) / 2), textSize);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return GeometryUtils.getEllipseByEnscribedRectangle(textSize);
    }
}
