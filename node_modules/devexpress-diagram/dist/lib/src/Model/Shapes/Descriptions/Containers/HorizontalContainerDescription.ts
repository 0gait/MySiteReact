import { ShapeDefaultDimension } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { ContainerDescription, CONTAINER_HEADER_SIZE, CONTAINER_HEADER_TOOLBOX_SIZE_RATIO } from "./ContainerDescription";
import { RectanglePrimitive } from "../../../../Render/Primitives/RectaglePrimitive";
import { TextAngle } from "../../../../Render/Primitives/TextPrimitive";

export class HorizontalContainerDescription extends ContainerDescription {
    constructor() {
        super(new Size(ShapeDefaultDimension * 2, ShapeDefaultDimension * 1.5));
    }

    get key(): string { return ShapeTypes.HorizontalContainer; }

    getExpandedSize(shape: Shape): Size {
        return new Size(shape.expandedSize.width, shape.size.height);
    }
    getCollapsedSize(shape: Shape): Size {
        return new Size(CONTAINER_HEADER_SIZE + 2 * shape.strokeWidth, shape.size.height);
    }
    allowResizeHorizontally(shape: Shape): boolean {
        return shape.expanded;
    }

    createHeaderPrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, height } = rect;

        const headerSize = this.getHeaderSize(shape, forToolbox);
        let primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        primitives = primitives.concat([
            new RectanglePrimitive(left, top, headerSize, height, shape.style)
        ]);
        if(!forToolbox)
            primitives = primitives.concat(
                this.createExpandButtonPrimitives(shape, new Rectangle(left, top, headerSize, headerSize))
            );

        return primitives;
    }
    getClientRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const headerSize = this.getHeaderSize(shape);
        return Rectangle.fromGeometry(new Point(rect.x + headerSize, rect.y), new Size(rect.width - headerSize, rect.height));
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const headerSize = this.getHeaderSize(shape);
        return Rectangle.fromGeometry(new Point(rect.x, rect.y + headerSize), new Size(headerSize, rect.height - headerSize))
            .nonNegativeSize();
    }
    getSizeByText(textSize: Size, shape: Shape): Size {
        const headerSize = this.getHeaderSize(shape);
        return new Size(shape.size.width, Math.max(shape.size.height, Math.max(textSize.width + headerSize, shape.size.height)));
    }
    getTextEditRectangle(shape: Shape): Rectangle {
        const rect = this.getTextRectangle(shape);
        return Rectangle.fromGeometry(
            new Point(rect.x, rect.y + rect.height),
            new Size(rect.height, rect.width)
        );
    }
    getTextAngle(): TextAngle {
        return TextAngle.Angle270deg;
    }
    getHeaderSize(shape: Shape, forToolbox?: boolean): number {
        const rect = shape.rectangle;
        return forToolbox ? rect.height * CONTAINER_HEADER_TOOLBOX_SIZE_RATIO : (CONTAINER_HEADER_SIZE + 2 * shape.strokeWidth);
    }
}
