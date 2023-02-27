import { SvgPrimitive } from "../../../Render/Primitives/Primitive";
import { Shape } from "../Shape";
import { ImagePrimitive } from "../../../Render/Primitives/ImagePrimitive";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ConnectionPoint } from "../../ConnectionPoint";
import { ConnectionPointSide } from "../../DiagramItem";
import { ShapeWithImageDescription } from "./ShapeWithImageDescription";
import { ICustomShape } from "../../../Interfaces";
import { ShapeDescription, ShapeDefaultDimension } from "./ShapeDescription";
import { ImageInfo } from "../../../Images/ImageInfo";
import { ImageCache, CacheImageInfo } from "../../../Images/ImageCache";
import { ImageLoader } from "../../../Images/ImageLoader";
import { ShapeParameters } from "../ShapeParameters";
import { ShapeParameterPoint } from "../ShapeParameterPoint";
import { SvgElementPrimitive } from "../../../Render/Primitives/SvgElementPrimitive";
import { TextAngle } from "../../../Render/Primitives/TextPrimitive";


export class CustomShapeDescription extends ShapeWithImageDescription {
    public title: string;
    public defaultText: string
    public defaultImageUrl: string

    private svgImage: ImageInfo;
    private svgToolboxImage: ImageInfo;
    private imageLoader = new ImageLoader(this.updateSvgImage.bind(this));

    constructor(public properties: ICustomShape, public baseDescription?: ShapeDescription) {
        super(
            new Size(
                properties.defaultWidth || baseDescription && baseDescription.defaultSize.width || ShapeDefaultDimension,
                properties.defaultHeight || baseDescription && baseDescription.defaultSize.height || ShapeDefaultDimension
            )
        );
        this.defaultText = properties.defaultText !== undefined ? properties.defaultText : baseDescription && baseDescription.getDefaultText();
        this.defaultImageUrl = properties.defaultImageUrl || baseDescription && baseDescription.getDefaultImageUrl();
        this.title = properties.title || baseDescription && baseDescription.getTitle() || this.defaultText || "";
        this.connectionPoints = this.createConnectionPoints();

        if(properties.svgUrl) {
            this.svgImage = new ImageInfo(properties.svgUrl);
            const cachedImage = ImageCache.instance.createUnloadedInfoByShapeImageInfo(this.svgImage);
            this.imageLoader.load(cachedImage);
        }
        if(properties.svgToolboxUrl) {
            this.svgToolboxImage = new ImageInfo(properties.svgToolboxUrl);
            const cachedImage = ImageCache.instance.createUnloadedInfoByShapeImageInfo(this.svgToolboxImage);
            this.imageLoader.load(cachedImage);
        }
    }

    get key() { return this.properties.type; }
    get allowEditText() { return this.properties.allowEditText !== false; }
    get allowEditImage() { return this.baseDescription ? this.baseDescription.allowEditImage : this.properties.allowEditImage === true; }
    get enableChildren() { return this.baseDescription && this.baseDescription.enableChildren; }
    get hasTemplate() { return !!this.properties.createTemplate; }
    get minWidth() { return this.properties.minWidth || this.baseDescription && this.baseDescription.minWidth; }
    get minHeight() { return this.properties.minHeight || this.baseDescription && this.baseDescription.minHeight; }
    get maxWidth() { return this.properties.maxWidth || this.baseDescription && this.baseDescription.maxWidth; }
    get maxHeight() { return this.properties.maxHeight || this.baseDescription && this.baseDescription.maxHeight; }
    get keepRatioOnAutoSize(): boolean { return this.properties.keepRatioOnAutoSize; }
    get toolboxSize() {
        if(this.properties.toolboxWidthToHeightRatio)
            return new Size(this.defaultSize.width, this.defaultSize.width / this.properties.toolboxWidthToHeightRatio);
        return this.defaultSize;
    }

    getTextAngle(): TextAngle {
        return (this.baseDescription && this.baseDescription.getTextAngle()) || super.getTextAngle();
    }
    getTitle() {
        return this.title !== undefined ? this.title : super.getTitle();
    }
    getDefaultText() {
        return this.defaultText !== undefined ? this.defaultText : super.getDefaultText();
    }
    getDefaultImageUrl() {
        return this.defaultImageUrl !== undefined ? this.defaultImageUrl : super.getDefaultImageUrl();
    }
    allowResizeHorizontally(shape: Shape) {
        if(this.properties.allowResize === false)
            return false;
        if(this.baseDescription)
            return this.baseDescription.allowResizeHorizontally(shape);
        return super.allowResizeHorizontally(shape);
    }
    allowResizeVertically(shape: Shape) {
        if(this.properties.allowResize === false)
            return false;
        if(this.baseDescription)
            return this.baseDescription.allowResizeVertically(shape);
        return super.allowResizeVertically(shape);
    }

    protected createConnectionPoints(): ConnectionPoint[] {
        if(this.properties && this.properties.connectionPoints && this.properties.connectionPoints.length)
            return this.properties.connectionPoints.map(ptObj => {
                if(ptObj && typeof ptObj["x"] === "number" && typeof ptObj["y"] === "number") {
                    const side = typeof ptObj["side"] === "number" ? ptObj["side"] : ConnectionPointSide.Undefined;
                    return new ConnectionPoint(ptObj["x"], ptObj["y"], side);
                }
            }).filter(pt => pt);
        return super.createConnectionPoints();
    }
    private getConnectionPointSides(): {[key: number]: number[]} {
        const result: {[key: number]: number[]} = {};
        for(let i = 0; i < this.connectionPoints.length; i++) {
            const pointSide = ShapeDescription.getConnectionPointSideByGeometry(this.connectionPoints[i]);
            if(!result[pointSide])
                result[pointSide] = [];
            result[pointSide].push(i);
        }
        return result;
    }
    getConnectionPointIndexForSide(side: ConnectionPointSide): number {
        const connectionPointSides = this.getConnectionPointSides();
        let pointIndexes = connectionPointSides[side];
        if(pointIndexes) {
            let index = Math.floor(pointIndexes.length / 2);
            if(pointIndexes.length % 2 === 0)
                index--;
            return pointIndexes[index];
        }
        else {
            pointIndexes = connectionPointSides[(side + 1) % 4];
            if(pointIndexes)
                return pointIndexes[0];
            else {
                pointIndexes = connectionPointSides[(side + 3) % 4];
                if(pointIndexes)
                    return pointIndexes[pointIndexes.length - 1];
                else {
                    pointIndexes = connectionPointSides[(side + 2) % 4];
                    if(pointIndexes)
                        return pointIndexes[0];
                }
            }
        }
        return side;
    }

    createImagePrimitives(shape: Shape, forToolbox: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        if(this.baseDescription)
            return this.baseDescription.createImagePrimitives(shape, forToolbox);
        return super.createImagePrimitives(shape, forToolbox);
    }
    createShapePrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        let primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        const { x: left, y: top, width, height } = shape.rectangle;
        if(this.baseDescription)
            primitives = this.baseDescription.createShapePrimitives(shape, forToolbox);
        else {
            const svgImage = forToolbox && this.svgToolboxImage ? this.svgToolboxImage : this.svgImage;
            if(svgImage) {
                const svgLeft = left + (this.properties.svgLeft && !forToolbox ? this.properties.svgLeft * width : 0);
                const svgTop = top + (this.properties.svgTop && !forToolbox ? this.properties.svgTop * height : 0);
                const svgWidth = this.properties.svgWidth && !forToolbox ? this.properties.svgWidth * width : width;
                const svgHeight = this.properties.svgHeight && !forToolbox ? this.properties.svgHeight * height : height;
                primitives = primitives.concat([
                    new ImagePrimitive(svgLeft, svgTop, svgWidth, svgHeight, svgImage.exportUrl)
                ]);
            }
        }
        const createTemplate = forToolbox && this.properties.createToolboxTemplate || this.properties.createTemplate;
        if(createTemplate) {
            const templateLeft = left + (this.properties.templateLeft && !forToolbox ? this.properties.templateLeft * width : 0);
            const templateTop = top + (this.properties.templateTop && !forToolbox ? this.properties.templateTop * height : 0);
            const templateWidth = this.properties.templateWidth && !forToolbox ? this.properties.templateWidth * width : width;
            const templateHeight = this.properties.templateHeight && !forToolbox ? this.properties.templateHeight * height : height;
            const nativeShape = this.properties.apiController ? this.properties.apiController.createNativeShape(shape) : shape.toNative();
            primitives = primitives.concat([
                new SvgElementPrimitive(
                    templateLeft, templateTop, templateWidth, templateHeight,
                    createTemplate, this.properties.destroyTemplate, nativeShape
                )
            ]);
        }
        return primitives;
    }
    createParameters(parameters: ShapeParameters) {
        if(this.baseDescription)
            return this.baseDescription.createParameters(parameters);
        else
            return super.createParameters(parameters);
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        if(this.baseDescription)
            this.baseDescription.normalizeParameters(shape, parameters);
        else
            super.normalizeParameters(shape, parameters);
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        if(this.baseDescription)
            this.baseDescription.modifyParameters(shape, parameters, deltaX, deltaY);
        else
            super.modifyParameters(shape, parameters, deltaX, deltaY);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        if(this.baseDescription)
            return this.baseDescription.getParameterPoints(shape);
        else
            return super.getParameterPoints(shape);
    }
    getTextRectangle(shape: Shape): Rectangle {
        if(this.baseDescription)
            return this.baseDescription.getTextRectangle(shape);
        else {
            const { x: left, y: top, width, height } = shape.rectangle;
            return new Rectangle(
                left + (this.properties.textLeft ? this.properties.textLeft * width : 0),
                top + (this.properties.textTop ? this.properties.textTop * height : 0),
                this.properties.textWidth ? this.properties.textWidth * width : width,
                this.properties.textHeight ? this.properties.textHeight * height : height,
            );
        }
    }
    getSizeByText(textSize: Size, shape: Shape): Size {
        if(this.baseDescription)
            return this.baseDescription.getSizeByText(textSize, shape);
        else {
            let textWidth = this.properties.textWidth;
            if(!textWidth)
                textWidth = 1;
            let textHeight = this.properties.textHeight;
            if(!textHeight)
                textHeight = 1;
            return new Size(textSize.width / textWidth, textSize.height / textHeight);
        }
    }
    getImageSize(shapeSize: Size, includeMargins: boolean, forToolbox?: boolean): Size {
        if(this.baseDescription) {
            if(this.baseDescription instanceof ShapeWithImageDescription)
                return this.baseDescription.getImageSize(shapeSize, includeMargins, forToolbox);
            return Size.empty();
        }
        return new Size(
            this.properties.imageWidth ? this.properties.imageWidth * shapeSize.width : shapeSize.width,
            this.properties.imageHeight ? this.properties.imageHeight * shapeSize.height : shapeSize.height)
            .nonNegativeSize();
    }
    getImagePlacementRectangle(rect: Rectangle, forToolbox?: boolean): Rectangle {
        if(this.baseDescription) {
            if(this.baseDescription instanceof ShapeWithImageDescription)
                return this.baseDescription.getImagePlacementRectangle(rect, forToolbox);
            return Rectangle.fromGeometry(Point.zero(), Size.empty());
        }
        const { x: left, y: top, width, height } = rect;
        return new Rectangle(
            left + (this.properties.imageLeft && !forToolbox ? this.properties.imageLeft * width : 0),
            top + (this.properties.imageTop && !forToolbox ? this.properties.imageTop * height : 0),
            this.properties.imageWidth && !forToolbox ? this.properties.imageWidth * width : width,
            this.properties.imageHeight && !forToolbox ? this.properties.imageHeight * height : height);
    }
    updateSvgImage(cacheImageInfo: CacheImageInfo): void {
        const isToolboxImage = cacheImageInfo.imageUrl && cacheImageInfo.imageUrl === this.properties.svgToolboxUrl;
        const svgImage = isToolboxImage ? this.svgToolboxImage : this.svgImage;
        if(cacheImageInfo.base64)
            svgImage.loadBase64Content(cacheImageInfo.base64);
        else
            svgImage.setUnableToLoadFlag();
        if(!isToolboxImage)
            this.raiseShapeDescriptionChanged(this);
    }
}
