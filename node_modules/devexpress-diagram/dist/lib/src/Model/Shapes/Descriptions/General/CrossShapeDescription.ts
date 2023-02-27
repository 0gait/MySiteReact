import { ShapeDescription, ShapeTextPadding } from "../ShapeDescription";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { ShapeParameter, ShapeParameters } from "../../ShapeParameters";
import { Shape } from "../../Shape";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

export const CrossHorizontalWidthParameterName = "chw";
export const CrossVerticalWidthParameterName = "cvw";

export class CrossShapeDescription extends ShapeDescription {
    get key(): string { return ShapeTypes.Cross; }
    get keepRatioOnAutoSize(): boolean { return true; }
    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom, width, height } = rect;
        const p0dx = (width - shape.parameters.get(CrossHorizontalWidthParameterName).value) / 2;
        const p1dy = (height - shape.parameters.get(CrossVerticalWidthParameterName).value) / 2;

        const p0x1 = shape.normalizeX(left + p0dx);
        const p1y1 = shape.normalizeY(top + p1dy);
        const p0x2 = shape.normalizeX(right - p0dx);
        const p1y2 = shape.normalizeY(bottom - p1dy);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(left, p1y1),
                new PathPrimitiveLineToCommand(p0x1, p1y1),
                new PathPrimitiveLineToCommand(p0x1, top),
                new PathPrimitiveLineToCommand(p0x2, top),
                new PathPrimitiveLineToCommand(p0x2, p1y1),
                new PathPrimitiveLineToCommand(right, p1y1),
                new PathPrimitiveLineToCommand(right, p1y2),
                new PathPrimitiveLineToCommand(p0x2, p1y2),
                new PathPrimitiveLineToCommand(p0x2, bottom),
                new PathPrimitiveLineToCommand(p0x1, bottom),
                new PathPrimitiveLineToCommand(p0x1, p1y2),
                new PathPrimitiveLineToCommand(left, p1y2),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    createParameters(parameters: ShapeParameters) {
        parameters.addRange([
            new ShapeParameter(CrossHorizontalWidthParameterName, this.defaultSize.width * 0.2),
            new ShapeParameter(CrossVerticalWidthParameterName, this.defaultSize.height * 0.2)
        ]);
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, CrossHorizontalWidthParameterName,
            p => Math.max(0, Math.min(shape.size.width, p.value)));
        this.changeParameterValue(parameters, CrossVerticalWidthParameterName,
            p => Math.max(0, Math.min(shape.size.height, p.value)));
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        this.changeParameterValue(parameters, CrossHorizontalWidthParameterName, p => p.value - deltaX * 2);
        this.changeParameterValue(parameters, CrossVerticalWidthParameterName, p => p.value - deltaY * 2);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        return [
            new ShapeParameterPoint("c",
                new Point(
                    shape.normalizeX(shape.position.x + (shape.size.width - shape.parameters.get(CrossHorizontalWidthParameterName).value) / 2),
                    shape.normalizeY(shape.position.y + (shape.size.height - shape.parameters.get(CrossVerticalWidthParameterName).value) / 2)
                )
            )
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle.clone().inflate(-ShapeTextPadding, -ShapeTextPadding);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return textSize.clone().offset(ShapeTextPadding * 2, ShapeTextPadding * 2);
    }
}
