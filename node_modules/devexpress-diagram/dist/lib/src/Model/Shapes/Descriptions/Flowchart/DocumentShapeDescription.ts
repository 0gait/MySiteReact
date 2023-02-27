import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand, PathPrimitiveQuadraticCurveToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ConnectionPointSide } from "../../../DiagramItem";
import { Style } from "../../../Style";
import { ConnectionPoint } from "../../../ConnectionPoint";

export class DocumentShapeDescription extends RectangleShapeDescription {
    static readonly curveOffsetRatio = 0.1;

    constructor() {
        super(undefined, true);
    }

    get key() { return ShapeTypes.Document; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        return this.createDocumentPrimitives(shape.rectangle, shape.style);
    }
    createDocumentPrimitives(rect: Rectangle, style: Style): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, right, bottom, width, height } = rect;
        const cx = rect.center.x;
        const dy = height * DocumentShapeDescription.curveOffsetRatio;

        const primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        return primitives.concat([
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, top),
                new PathPrimitiveLineToCommand(right, top),
                new PathPrimitiveLineToCommand(right, bottom),
                new PathPrimitiveQuadraticCurveToCommand(right - width * 0.25, bottom - 2 * dy, cx, bottom - dy),
                new PathPrimitiveQuadraticCurveToCommand(left + width * 0.25, bottom + dy, left, bottom - dy),
                new PathPrimitiveClosePathCommand()
            ], style)
        ]);
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.South)
            point.y -= shape.size.height * DocumentShapeDescription.curveOffsetRatio;
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        return rect.clone().resize(0, -rect.height * DocumentShapeDescription.curveOffsetRatio);
    }
}
