import { ShapeDescription, ShapeDefaultDimension, ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { RectanglePrimitive } from "../../../../Render/Primitives/RectaglePrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export class RectangleShapeDescription extends ShapeDescription {

    constructor(defaultSize: Size = new Size(ShapeDefaultDimension, ShapeDefaultDimension * 0.75), hasDefaultText?: boolean) {
        super(defaultSize, hasDefaultText);
    }

    get key(): string { return ShapeTypes.Rectangle; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, width, height } = shape.rectangle;

        return [
            new RectanglePrimitive(left, top, width, height, shape.style),
        ];
    }
    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle.clone().inflate(-ShapeTextPadding, -ShapeTextPadding);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return textSize.clone().offset(ShapeTextPadding * 2, ShapeTextPadding * 2);
    }
}
