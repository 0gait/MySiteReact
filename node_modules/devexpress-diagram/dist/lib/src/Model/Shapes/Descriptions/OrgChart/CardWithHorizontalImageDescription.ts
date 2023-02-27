import { ShapeDefaultDimension } from "../ShapeDescription";
import { ShapeTypes } from "../../ShapeTypes";
import { CardBaseDescription } from "./CardBaseDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";

abstract class CardWithHorizontalImageDescription extends CardBaseDescription {
    constructor() {
        super(new Size(1.5 * ShapeDefaultDimension, 0.5 * ShapeDefaultDimension));
    }
    protected isHorizontal: boolean = true;

    getToolboxHeightToWidthRatio(_width: number, _height: number): number {
        return 26 / 46;
    }

    getImageSize(shapeSize: Size, includeMargins: boolean, forToolbox?: boolean): Size {
        let imageSize = Math.min(shapeSize.height, shapeSize.width);
        if(!includeMargins)
            imageSize = Math.max(0, imageSize - 2 * this.getImageMargin(forToolbox));
        return new Size(imageSize, imageSize);
    }
    protected getImageSizeByTextBlockSize(textBlockSize: Size): Size {
        return this.getImageSize(new Size(Number.MAX_VALUE, textBlockSize.height), true);
    }
}

export class CardWithImageOnLeftDescription extends CardWithHorizontalImageDescription {
    get key(): string { return ShapeTypes.CardWithImageOnLeft; }
    isTextAfterImage: boolean = true;
}

export class CardWithImageOnRightDescription extends CardWithHorizontalImageDescription {
    get key(): string { return ShapeTypes.CardWithImageOnRight; }
    isTextAfterImage: boolean = false;
}
