import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand, PathPrimitiveQuadraticCurveToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Style } from "../../../Style";
import { DocumentShapeDescription } from "./DocumentShapeDescription";
import { ClipPathPrimitive } from "../../../../Render/Primitives/ClipPathPrimitive";
import { RenderUtils } from "../../../../Render/Utils";
import { ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class MultipleDocumentsShapeDescription extends DocumentShapeDescription {
    static readonly documentsOffsetRatio = 0.1;
    static readonly documentsOffsetRatioForToolbox = 0.16;

    get key(): string { return ShapeTypes.MultipleDocuments; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        let rect = shape.rectangle;
        const { width, height } = shape.rectangle;
        const ratio = forToolbox ? MultipleDocumentsShapeDescription.documentsOffsetRatioForToolbox : MultipleDocumentsShapeDescription.documentsOffsetRatio;
        const documentOffsetX = Math.ceil(width * ratio);
        const documentOffsetY = Math.ceil(height * ratio);
        rect = rect.clone().inflate(-documentOffsetX, -documentOffsetY).clone().moveRectangle(-documentOffsetX, -documentOffsetY);

        const rect1 = rect.clone().moveRectangle(documentOffsetX, documentOffsetY);
        const rect2 = rect1.clone().moveRectangle(documentOffsetX, documentOffsetY);
        const clipPathId = RenderUtils.generateSvgElementId("clipRect");
        const primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        return primitives
            .concat(this.createDocumentPrimitives(rect, shape.style, clipPathId + "1", rect1))
            .concat(this.createDocumentPrimitives(rect1, shape.style, clipPathId + "2", rect2))
            .concat(this.createDocumentPrimitives(rect2, shape.style));
    }
    createDocumentPrimitives(rect: Rectangle, style: Style, clipPathId?: string, clipRect?: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, right, bottom, width, height } = rect;
        const cx = rect.center.x;
        const dy = height * DocumentShapeDescription.curveOffsetRatio;

        let primitives = [];
        primitives = primitives.concat([
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, top),
                new PathPrimitiveLineToCommand(right, top),
                new PathPrimitiveLineToCommand(right, bottom),
                new PathPrimitiveQuadraticCurveToCommand(right - width * 0.25, bottom - 2 * dy, cx, bottom - dy),
                new PathPrimitiveQuadraticCurveToCommand(left + width * 0.25, bottom + dy, left, bottom - dy),
                new PathPrimitiveClosePathCommand()
            ], style, undefined, clipRect && clipPathId)
        ]);
        if(clipRect && clipPathId)
            primitives = primitives.concat([
                new ClipPathPrimitive(clipPathId, [
                    new PathPrimitive([
                        new PathPrimitiveMoveToCommand(left - style.strokeWidth, top - style.strokeWidth),
                        new PathPrimitiveLineToCommand(right + style.strokeWidth, top - style.strokeWidth),
                        new PathPrimitiveLineToCommand(right + style.strokeWidth, clipRect.y),
                        new PathPrimitiveLineToCommand(clipRect.x, clipRect.y),
                        new PathPrimitiveLineToCommand(clipRect.x, bottom + style.strokeWidth),
                        new PathPrimitiveLineToCommand(left - style.strokeWidth, bottom + style.strokeWidth),
                        new PathPrimitiveClosePathCommand()
                    ])
                ])
            ]);

        return primitives;
    }
    getTextRectangle(shape: Shape): Rectangle {
        let rect = shape.rectangle;
        const documentOffsetX = rect.width * MultipleDocumentsShapeDescription.documentsOffsetRatio;
        const documentOffsetY = rect.height * MultipleDocumentsShapeDescription.documentsOffsetRatio;
        rect = rect.clone().inflate(-documentOffsetX, -documentOffsetY).clone().moveRectangle(-documentOffsetX, -documentOffsetY);
        const innerRect = rect.clone().moveRectangle(2 * documentOffsetX + ShapeTextPadding, 2 * documentOffsetY + ShapeTextPadding);
        return innerRect.clone().resize(-2 * ShapeTextPadding, -rect.height * DocumentShapeDescription.curveOffsetRatio - 2 * ShapeTextPadding);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return new Size(
            (textSize.width + 2 * ShapeTextPadding) / (1 - 2 * MultipleDocumentsShapeDescription.documentsOffsetRatio),
            (textSize.height + 2 * ShapeTextPadding) / ((1 - DocumentShapeDescription.curveOffsetRatio) * (1 - MultipleDocumentsShapeDescription.documentsOffsetRatio)))
            .nonNegativeSize();
    }
}
