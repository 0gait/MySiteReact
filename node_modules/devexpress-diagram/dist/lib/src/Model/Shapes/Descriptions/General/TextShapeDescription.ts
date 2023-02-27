import { ShapeDescription, ShapeDefaultDimension } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { ShapeTypes } from "../../ShapeTypes";
import { ClipPathPrimitive } from "../../../../Render/Primitives/ClipPathPrimitive";
import { RectanglePrimitive } from "../../../../Render/Primitives/RectaglePrimitive";
import { RenderUtils } from "../../../../Render/Utils";

export class TextShapeDescription extends ShapeDescription {
    private textClipPathId = RenderUtils.generateSvgElementId("clipRect");

    constructor() {
        super(new Size(ShapeDefaultDimension, ShapeDefaultDimension * 0.5), true);
    }

    get key() { return ShapeTypes.Text; }
    get keepRatioOnAutoSize(): boolean { return false; }

    createShapePrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        if(forToolbox) {
            const { x: left, y: top, width, height } = shape.rectangle;
            return <any>[
                new ClipPathPrimitive(this.getTextClipPathId(forToolbox), [
                    new RectanglePrimitive(left, top, width, height)
                ])
            ];
        }
        return [];
    }
    getTextClipPathId(forToolbox?: boolean): string {
        return forToolbox ? this.textClipPathId : undefined;
    }
    getSizeByTextRectangle(textSize: Size): Size {
        return textSize;
    }
    getSizeByText(textSize: Size, shape: Shape): Size {
        return textSize.clone();
    }
    getTextRectangle(shape: Shape): Rectangle {
        return shape.rectangle;
    }
}
