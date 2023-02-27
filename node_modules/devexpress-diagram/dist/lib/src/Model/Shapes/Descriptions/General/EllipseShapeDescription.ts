import { ShapeDescription, ShapeDefaultDimension } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { EllipsePrimitive } from "../../../../Render/Primitives/EllipsePrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { GeometryUtils } from "../../../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class EllipseShapeDescription extends ShapeDescription {
    constructor(hasDefaultText?: boolean) {
        super(new Size(ShapeDefaultDimension, ShapeDefaultDimension * 0.75), hasDefaultText);
    }

    get key(): string { return ShapeTypes.Ellipse; }
    get keepRatioOnAutoSize(): boolean { return false; }

    getTextRectangle(shape: Shape): Rectangle {
        const textSize = GeometryUtils.getMaxRectangleEnscribedInEllipse(shape.size);
        return Rectangle.fromGeometry(shape.position.clone().offset((shape.size.width - textSize.width) / 2, (shape.size.height - textSize.height) / 2), textSize);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return GeometryUtils.getEllipseByEnscribedRectangle(textSize);
    }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { width, height } = rect;
        const { x: cx, y: cy } = rect.center;

        return [
            new EllipsePrimitive(cx, cy, width / 2, height / 2, shape.style),
        ];
    }
}
