import { ShapeDescription, ShapeDefaultDimension, ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeParameter, ShapeParameters } from "../../ShapeParameters";
import { Shape } from "../../Shape";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export const ArrowVerticalTriangleHeightParameterName = "th";
export const ArrowVerticalLineWidthParameterName = "lw";

export abstract class ArrowVerticalShapeDescription extends ShapeDescription {
    constructor() {
        super(new Size(ShapeDefaultDimension * 0.375, ShapeDefaultDimension));
    }

    get keepRatioOnAutoSize(): boolean { return false; }

    createParameters(parameters: ShapeParameters) {
        parameters.addRange([
            new ShapeParameter(ArrowVerticalTriangleHeightParameterName, Math.sqrt(Math.pow(this.defaultSize.width, 2) - Math.pow(this.defaultSize.width / 2, 2))),
            new ShapeParameter(ArrowVerticalLineWidthParameterName, this.defaultSize.width / 3)
        ]);
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleHeightParameterName,
            p => Math.max(0, Math.min(shape.size.height, p.value)));
        this.changeParameterValue(parameters, ArrowVerticalLineWidthParameterName,
            p => Math.max(0, Math.min(shape.size.width, p.value)));
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        const delta = (shape.size.width - shape.parameters.get(ArrowVerticalLineWidthParameterName).value) / 2;
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.East)
            point.x -= delta;
        else if(side === ConnectionPointSide.West)
            point.x += delta;
    }
    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle.clone().inflate(-ShapeTextPadding, -ShapeTextPadding);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return textSize.clone().offset(ShapeTextPadding * 2, ShapeTextPadding * 2);
    }
}
