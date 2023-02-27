import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand, PathPrimitiveQuadraticCurveToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectionPointSide } from "../../../DiagramItem";
import { Style } from "../../../Style";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class PaperTapeShapeDescription extends RectangleShapeDescription {
    static readonly curveOffsetRatio = 0.1;

    constructor() {
        super(undefined, true);
    }

    get key() { return ShapeTypes.PaperTape; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        return this.createDocumentPrimitives(shape.rectangle, shape.style);
    }
    createDocumentPrimitives(rect: Rectangle, style: Style): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, right, bottom, width, height } = rect;
        const cx = rect.center.x;
        const dy = height * PaperTapeShapeDescription.curveOffsetRatio;

        const primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        return primitives.concat([
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, top),
                new PathPrimitiveQuadraticCurveToCommand(left + width * 0.25, top + 2 * dy, cx, top + dy),
                new PathPrimitiveQuadraticCurveToCommand(right - width * 0.25, top - dy, right, top + dy),
                new PathPrimitiveLineToCommand(right, bottom),
                new PathPrimitiveQuadraticCurveToCommand(right - width * 0.25, bottom - 2 * dy, cx, bottom - dy),
                new PathPrimitiveQuadraticCurveToCommand(left + width * 0.25, bottom + dy, left, bottom - dy),
                new PathPrimitiveClosePathCommand()
            ], style)
        ]);
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.North)
            point.y += shape.size.height * PaperTapeShapeDescription.curveOffsetRatio;
        if(side === ConnectionPointSide.South)
            point.y -= shape.size.height * PaperTapeShapeDescription.curveOffsetRatio;
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        return rect.clone().inflate(ShapeTextPadding, -rect.height * PaperTapeShapeDescription.curveOffsetRatio);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return new Size(textSize.width + ShapeTextPadding * 2, textSize.height / (1 - 2 * PaperTapeShapeDescription.curveOffsetRatio));
    }
}
