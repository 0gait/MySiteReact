import { ShapeDefaultDimension, ShapeTextPadding } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { ShapeWithImageDescription, SHAPE_IMAGE_CLASSNAMES } from "../ShapeWithImageDescription";
import { RoundedRectanglePrimitive } from "../../../../Render/Primitives/RoundedRectanglePrimitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { GroupPrimitive } from "../../../../Render/Primitives/GroupPrimitive";
import { ShapeImageIndicator } from "../../../../Render/ShapeImageIndicator";
import { ShapeTypes } from "../../ShapeTypes";
import { DiagramLocalizationService } from "../../../../LocalizationService";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { Point } from "@devexpress/utils/lib/geometry/point";

export abstract class CardBaseDescription extends ShapeWithImageDescription {
    constructor(defaultSize: Size = new Size(ShapeDefaultDimension, 26 / 46 * ShapeDefaultDimension)) {
        super(defaultSize, true);
    }

    get keepRatioOnAutoSize(): boolean { return false; }
    protected abstract isHorizontal: boolean;
    protected abstract isTextAfterImage: boolean;

    getDefaultText(): string {
        return DiagramLocalizationService.shapeTexts[ShapeTypes.Card];
    }

    createShapePrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, width, height } = shape.rectangle;
        return [
            new RoundedRectanglePrimitive(left, top, width, height, (forToolbox) ? 30 : 60,
                (forToolbox) ? 30 : 60, shape.style)
        ];
    }
    createImagePlaceholder(rect: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        return [
            new RoundedRectanglePrimitive(rect.x, rect.y, rect.width, rect.height, UnitConverter.pixelsToTwips(2), UnitConverter.pixelsToTwips(2),
                undefined, SHAPE_IMAGE_CLASSNAMES.IMAGE_PLACEHOLDER)
        ];
    }
    createEmptyImagePrimitive(rect: Rectangle): GroupPrimitive {
        return ShapeImageIndicator.createUserIconPrimitives(rect.x, rect.y, this.defaultIconSize, UnitConverter.pixelsToTwips(1), SHAPE_IMAGE_CLASSNAMES.USER_PIC);
    }
    createWarningPrimitive(rect: Rectangle): GroupPrimitive {
        return ShapeImageIndicator.createWarningIconPrimitives(rect.x + this.defaultIconSize / 2, rect.y + this.defaultIconSize / 2, this.defaultIconSize / 2, SHAPE_IMAGE_CLASSNAMES.WARNING_MARK);
    }
    getTextRectangle(shape: Shape): Rectangle {
        const rect = shape.rectangle;
        const textRectangle = rect.clone().inflate(-ShapeTextPadding, -ShapeTextPadding);
        const imgBlockSize = this.getImageSize(rect.createSize(), true);

        if(this.isTextAfterImage)
            textRectangle.moveRectangle(this.isHorizontal ? imgBlockSize.width : 0, this.isHorizontal ? 0 : imgBlockSize.height);
        textRectangle.resize(this.isHorizontal ? -imgBlockSize.width : 0, this.isHorizontal ? 0 : -imgBlockSize.height);
        return textRectangle.nonNegativeSize();
    }
    getSizeByText(textSize: Size, _shape: Shape): Size {
        const size = textSize.clone().offset(ShapeTextPadding * 2, ShapeTextPadding * 2);
        const imgBlockSize = this.getImageSizeByTextBlockSize(size);
        if(this.isHorizontal)
            size.width += imgBlockSize.width;
        else
            size.height += imgBlockSize.height;
        return size;
    }
    protected abstract getImageSizeByTextBlockSize(textBlockSize: Size): Size;
    createTextPrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        if(forToolbox)
            return this.createGraphicalTextRepresentation(shape.rectangle);
        else
            return super.createTextPrimitives(shape, forToolbox);
    }
    createGraphicalTextRepresentation(rect: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        const textRect = new Rectangle(0, 0, 0, 0);
        const imgBlockSize = this.getImageSize(rect.createSize(), true, true);

        if(this.isHorizontal) {
            const horizontalShift = this.isTextAfterImage ? rect.width / 2 - UnitConverter.pixelsToTwips(2) : 0;
            textRect.x = rect.x + horizontalShift + UnitConverter.pixelsToTwips(4);
            textRect.y = rect.y + UnitConverter.pixelsToTwips(5);

            textRect.width = imgBlockSize.width - UnitConverter.pixelsToTwips(4);
            textRect.height = rect.height - UnitConverter.pixelsToTwips(6);
        }
        else {
            const verticalShift = this.isTextAfterImage ? rect.height / 2 - UnitConverter.pixelsToTwips(2) : 0;
            textRect.x = rect.x + rect.width / 4;
            textRect.y = rect.y + verticalShift + UnitConverter.pixelsToTwips(4);

            textRect.width = rect.width / 2;
            textRect.height = imgBlockSize.height - UnitConverter.pixelsToTwips(2);
        }
        return this.createTextRepresentationPrimitives(textRect);
    }
    getImagePlacementRectangle(rect: Rectangle, forToolbox?: boolean): Rectangle {
        const imageSize = this.getImageSize(rect.createSize(), false, forToolbox);
        const imageRectangle = Rectangle.fromGeometry(new Point(rect.x, rect.y), imageSize);
        const imgBlockSize = this.getImageSize(rect.createSize(), true, forToolbox);

        if(this.isHorizontal && this.isTextAfterImage)
            imageRectangle.x += this.getImageMargin(forToolbox);
        else if(this.isHorizontal)
            imageRectangle.x = rect.right - imgBlockSize.width - this.getImageMargin(forToolbox);
        if(!this.isHorizontal && !this.isTextAfterImage)
            imageRectangle.y = rect.bottom - imgBlockSize.height - this.getImageMargin(forToolbox);
        else
            imageRectangle.y += this.getImageMargin(forToolbox);

        if(!this.isHorizontal)
            imageRectangle.x += (rect.width - imageRectangle.width) / 2;
        return imageRectangle;
    }
    createTextRepresentationPrimitives(rect: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        const lineHeight = UnitConverter.pixelsToTwips(UnitConverter.twipsToPixels(rect.height / 3));
        return [
            new GroupPrimitive([
                new PathPrimitive([
                    new PathPrimitiveMoveToCommand(rect.x, rect.y),
                    new PathPrimitiveLineToCommand(rect.x + rect.width, rect.y)]),
                new PathPrimitive([
                    new PathPrimitiveMoveToCommand(rect.x, rect.y + lineHeight),
                    new PathPrimitiveLineToCommand(rect.x + rect.width, rect.y + lineHeight)]),
                new PathPrimitive([
                    new PathPrimitiveMoveToCommand(rect.x, rect.y + lineHeight * 2),
                    new PathPrimitiveLineToCommand(rect.x + rect.width * 0.66, rect.y + lineHeight * 2)])
            ], "dxdi-shape-text")
        ];
    }
}
