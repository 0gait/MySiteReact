import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { ShapeParameters, ShapeParameter } from "../../ShapeParameters";
import { Shape } from "../../Shape";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand } from "../../../../Render/Primitives/PathPrimitive";

export const InternalStorageHorizontalEdgeParameterName = "he";
export const InternalStorageVerticalEdgeParameterName = "ve";

export class InternalStorageShapeDescription extends RectangleShapeDescription {
    static readonly minEdge = 72;

    constructor() {
        super(undefined, true);
    }

    get key() { return ShapeTypes.InternalStorage; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;
        const x = left + shape.parameters.get(InternalStorageHorizontalEdgeParameterName).value;
        const y = top + shape.parameters.get(InternalStorageVerticalEdgeParameterName).value;

        const primitives: SvgPrimitive<SVGGraphicsElement>[] = super.createShapePrimitives(shape);
        return primitives.concat([
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(x, top),
                new PathPrimitiveLineToCommand(x, bottom),
                new PathPrimitiveMoveToCommand(left, y),
                new PathPrimitiveLineToCommand(right, y)
            ], shape.style)
        ]);
    }
    createParameters(parameters: ShapeParameters) {
        parameters.addRange([
            new ShapeParameter(InternalStorageHorizontalEdgeParameterName, this.defaultSize.width * 0.1),
            new ShapeParameter(InternalStorageVerticalEdgeParameterName, this.defaultSize.width * 0.1)
        ]);
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, InternalStorageHorizontalEdgeParameterName,
            p => Math.max(InternalStorageShapeDescription.minEdge, Math.min(shape.size.width * 0.3, p.value)));
        this.changeParameterValue(parameters, InternalStorageVerticalEdgeParameterName,
            p => Math.max(InternalStorageShapeDescription.minEdge, Math.min(shape.size.height * 0.3, p.value)));
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        this.changeParameterValue(parameters, InternalStorageHorizontalEdgeParameterName, p => p.value + deltaX);
        this.changeParameterValue(parameters, InternalStorageVerticalEdgeParameterName, p => p.value + deltaY);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        return [
            new ShapeParameterPoint("c",
                new Point(
                    shape.normalizeX(shape.position.x + shape.parameters.get(InternalStorageHorizontalEdgeParameterName).value),
                    shape.normalizeY(shape.position.y + shape.parameters.get(InternalStorageVerticalEdgeParameterName).value),
                )
            )
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const dx = shape.parameters.get(InternalStorageHorizontalEdgeParameterName).value;
        return rect.clone().resize(-dx, 0).clone().moveRectangle(dx, 0);
    }
}
