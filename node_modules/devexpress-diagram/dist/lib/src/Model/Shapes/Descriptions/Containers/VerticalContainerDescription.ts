import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";

import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { RectanglePrimitive } from "../../../../Render/Primitives/RectaglePrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Shape } from "../../Shape";
import { ShapeTypes } from "../../ShapeTypes";
import { ShapeDefaultDimension } from "../ShapeDescription";
import {
    CONTAINER_HEADER_SIZE, CONTAINER_HEADER_TOOLBOX_SIZE_RATIO, ContainerDescription
} from "./ContainerDescription";

export class VerticalContainerDescription extends ContainerDescription {
    constructor() {
        super(new Size(ShapeDefaultDimension * 2, ShapeDefaultDimension * 1.5));
    }

    get key(): string { return ShapeTypes.VerticalContainer; }

    getExpandedSize(shape: Shape): Size {
        return new Size(shape.size.width, shape.expandedSize.height);
    }
    getCollapsedSize(shape: Shape): Size {
        return new Size(shape.size.width, CONTAINER_HEADER_SIZE + 2 * shape.strokeWidth);
    }
    allowResizeVertically(shape: Shape): boolean {
        return shape.expanded;
    }

    createHeaderPrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, width } = rect;

        const headerSize = this.getHeaderSize(shape, forToolbox);
        let primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        primitives = primitives.concat([
            new RectanglePrimitive(left, top, width, headerSize, shape.style)
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
        return Rectangle.fromGeometry(new Point(rect.x, rect.y + headerSize), new Size(rect.width, rect.height - headerSize));
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const headerSize = this.getHeaderSize(shape);
        return Rectangle.fromGeometry(new Point(rect.x + headerSize, rect.y), new Size(rect.width - headerSize, headerSize));
    }
    getSizeByText(textSize: Size, shape: Shape): Size {
        const headerSize = this.getHeaderSize(shape);
        return new Size(Math.max(shape.size.width, textSize.width + headerSize), shape.size.height);
    }
    getHeaderSize(shape: Shape, forToolbox?: boolean): number {
        const rect = shape.rectangle;
        return forToolbox ? rect.height * CONTAINER_HEADER_TOOLBOX_SIZE_RATIO : (CONTAINER_HEADER_SIZE + 2 * shape.strokeWidth);
    }
}
