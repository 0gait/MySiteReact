import { RectangleShapeDescription } from "../General/RectangleShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { ShapeParameters, ShapeParameter } from "../../ShapeParameters";
import { Shape } from "../../Shape";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand } from "../../../../Render/Primitives/PathPrimitive";

export const PredefinedProcessEdgeParameterName = "e";

export class PredefinedProcessShapeDescription extends RectangleShapeDescription {
    static readonly minEdge = 72;

    constructor() {
        super(undefined, true);
    }

    get key() { return ShapeTypes.PredefinedProcess; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, bottom } = rect;
        const x1 = left + shape.parameters.get(PredefinedProcessEdgeParameterName).value;
        const x2 = right - shape.parameters.get(PredefinedProcessEdgeParameterName).value;

        const primitives: SvgPrimitive<SVGGraphicsElement>[] = super.createShapePrimitives(shape);
        return primitives.concat([
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(x1, top),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveMoveToCommand(x2, top),
                new PathPrimitiveLineToCommand(x2, bottom)
            ], shape.style)
        ]);
    }
    createParameters(parameters: ShapeParameters) {
        parameters.add(
            new ShapeParameter(PredefinedProcessEdgeParameterName, this.defaultSize.width * 0.1)
        );
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, PredefinedProcessEdgeParameterName,
            p => Math.max(PredefinedProcessShapeDescription.minEdge, Math.min(shape.size.width * 0.3, p.value)));
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        this.changeParameterValue(parameters, PredefinedProcessEdgeParameterName, p => p.value + deltaX);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        return [
            new ShapeParameterPoint("c",
                new Point(
                    shape.normalizeX(shape.position.x + shape.parameters.get(PredefinedProcessEdgeParameterName).value),
                    shape.position.y
                )
            )
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const dx = shape.parameters.get(PredefinedProcessEdgeParameterName).value;
        return rect.clone().resize(-2 * dx, 0).clone().moveRectangle(dx, 0);
    }
}
