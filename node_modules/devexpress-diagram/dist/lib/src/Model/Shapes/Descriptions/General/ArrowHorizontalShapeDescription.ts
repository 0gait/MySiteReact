import { ShapeDescription, ShapeDefaultDimension, ShapeTextPadding } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeParameter, ShapeParameters } from "../../ShapeParameters";
import { Shape } from "../../Shape";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";

export const ArrowVerticalTriangleWidthParameterName = "tw";
export const ArrowVerticalLineHeightParameterName = "lh";

export abstract class ArrowHorizontalShapeDescription extends ShapeDescription {
    constructor() {
        super(new Size(ShapeDefaultDimension, ShapeDefaultDimension * 0.375));
    }

    get keepRatioOnAutoSize(): boolean { return false; }

    createParameters(parameters: ShapeParameters): void {
        parameters.addRange([
            new ShapeParameter(ArrowVerticalTriangleWidthParameterName, Math.sqrt(Math.pow(this.defaultSize.height, 2) - Math.pow(this.defaultSize.height / 2, 2))),
            new ShapeParameter(ArrowVerticalLineHeightParameterName, this.defaultSize.height / 3)
        ]);
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        this.changeParameterValue(parameters, ArrowVerticalTriangleWidthParameterName,
            p => Math.max(0, Math.min(shape.size.width, p.value)));
        this.changeParameterValue(parameters, ArrowVerticalLineHeightParameterName,
            p => Math.max(0, Math.min(shape.size.height, p.value)));
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        const delta = (shape.size.height - shape.parameters.get(ArrowVerticalLineHeightParameterName).value) / 2;
        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.North)
            point.y += delta;
        else if(side === ConnectionPointSide.South)
            point.y -= delta;
    }
    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle.clone().inflate(-ShapeTextPadding, -ShapeTextPadding);
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        return textSize.clone().offset(ShapeTextPadding * 2, ShapeTextPadding * 2);
    }
}
