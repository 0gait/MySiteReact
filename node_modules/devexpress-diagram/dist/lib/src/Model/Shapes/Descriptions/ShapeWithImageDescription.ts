import { ShapeDescription } from "./ShapeDescription";
import { SvgPrimitive } from "../../../Render/Primitives/Primitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Shape } from "../Shape";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { ImagePrimitive } from "../../../Render/Primitives/ImagePrimitive";
import { RectanglePrimitive } from "../../../Render/Primitives/RectaglePrimitive";
import { GroupPrimitive } from "../../../Render/Primitives/GroupPrimitive";
import { RenderUtils } from "../../../Render/Utils";
import { ClipPathPrimitive } from "../../../Render/Primitives/ClipPathPrimitive";
import { ShapeImageIndicator } from "../../../Render/ShapeImageIndicator";

export const ShapeDefaultDimension = 1440;
export const ShapeDefaultSize = new Size(ShapeDefaultDimension, ShapeDefaultDimension);

export const SHAPE_IMAGE_CLASSNAMES = {
    IMAGE: "dxdi-image",
    IMAGE_PLACEHOLDER: "dxdi-image-placeholder",
    LOADING_INDICATOR: "dxdi-spinner",
    USER_PIC: "dxdi-user",
    WARNING_MARK: "dxdi-warning"
};

export abstract class ShapeWithImageDescription extends ShapeDescription {
    static readonly imageScalingRule = "xMidYMid meet";
    protected readonly defaultIconSize = 480;

    constructor(defaultSize: Size = ShapeDefaultSize.clone(), protected hasDefaultText?: boolean) {
        super(defaultSize, hasDefaultText);
    }

    get enableImage() { return true; }

    protected getImageMargin(forToolbox: boolean) {
        return forToolbox ? UnitConverter.pixelsToTwips(2) : UnitConverter.pixelsToTwips(3);
    }

    createImagePrimitives(shape: Shape, forToolbox: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        if(!this.enableImage) return [];

        const rect = this.getImagePlacementRectangle(shape.rectangle, forToolbox);

        if(forToolbox) return this.createImagePlaceholder(rect);

        let imagePrimitives = [];
        if(shape.image.isEmpty || shape.image.unableToLoad)
            imagePrimitives = imagePrimitives.concat(this.createEmptyImagePrimitives(rect, shape.image.unableToLoad));
        else if(shape.image.renderUrl === "")
            imagePrimitives = imagePrimitives.concat(this.createLoadingImagePrimitives(rect));
        else
            imagePrimitives = imagePrimitives.concat(this.createLoadedImagePrimitives(rect, shape.image.renderUrl));

        if(shape.image.renderUrl === "") {
            const clipPathId = RenderUtils.generateSvgElementId("clipImage");
            return [].concat([
                new GroupPrimitive(imagePrimitives, SHAPE_IMAGE_CLASSNAMES.IMAGE, undefined, clipPathId),
                new ClipPathPrimitive(clipPathId,
                    [ new RectanglePrimitive(rect.x, rect.y, rect.width, rect.height) ]
                )
            ]);
        }
        else
            return imagePrimitives;
    }
    createImagePlaceholder(rect: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        return [];
    }
    createLoadedImagePrimitives(rect: Rectangle, imageUrl: string): SvgPrimitive<SVGGraphicsElement>[] {
        return [
            new ImagePrimitive(rect.x, rect.y, rect.width, rect.height, imageUrl, ShapeWithImageDescription.imageScalingRule, undefined, SHAPE_IMAGE_CLASSNAMES.IMAGE)
        ];
    }
    createLoadingImagePrimitives(rect: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        const loadingRect = this.getIconPlacementRectangle(rect);
        return [
            ShapeImageIndicator.createLoadingIndicatorPrimitives(loadingRect.x, loadingRect.y, this.defaultIconSize, UnitConverter.pixelsToTwips(5),
                SHAPE_IMAGE_CLASSNAMES.LOADING_INDICATOR)
        ];
    }
    createEmptyImagePrimitives(rect: Rectangle, showWarning?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        const loadingRect = this.getIconPlacementRectangle(rect);
        let primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        primitives = primitives.concat(
            this.createEmptyImagePrimitive(loadingRect));
        if(showWarning)
            primitives = primitives.concat(this.createWarningPrimitive(loadingRect));
        return primitives;
    }
    createEmptyImagePrimitive(rect: Rectangle): GroupPrimitive {
        return new GroupPrimitive([]);
    }
    createWarningPrimitive(rect: Rectangle): GroupPrimitive {
        return new GroupPrimitive([]);
    }
    getIconPlacementRectangle(rect: Rectangle): Rectangle {
        const iconRect = Rectangle.fromGeometry(new Point(rect.x, rect.y), new Size(this.defaultIconSize, this.defaultIconSize));
        if(iconRect.width < rect.width)
            iconRect.x = rect.x + (rect.width - iconRect.width) / 2;
        if(iconRect.height < rect.height)
            iconRect.y = rect.y + (rect.height - iconRect.height) / 2;
        return iconRect;
    }

    abstract getImagePlacementRectangle(rect: Rectangle, forToolbox?: boolean): Rectangle;
    abstract getImageSize(shapeSize: Size, includeMargins: boolean, forToolbox?: boolean): Size;
}
