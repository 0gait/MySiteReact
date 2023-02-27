import { ShapeDefaultDimension } from "../ShapeDescription";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeTypes } from "../../ShapeTypes";
import { CardBaseDescription } from "./CardBaseDescription";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";

export class CardWithImageOnTopDescription extends CardBaseDescription {
    constructor() {
        super(new Size(32 / 40 * ShapeDefaultDimension, ShapeDefaultDimension));
    }

    get key(): string { return ShapeTypes.CardWithImageOnTop; }
    protected isTextAfterImage: boolean = true;
    protected isHorizontal: boolean = false;

    getImageSize(shapeSize: Size, includeMargins: boolean, forToolbox?: boolean): Size {
        let w = shapeSize.width / 2;
        if(UnitConverter.twipsToPixels(w) % 2 === 1)
            w -= UnitConverter.pixelsToTwips(1);
        let imageSize = Math.max(0, shapeSize.height - (includeMargins ? 0 : 2 * this.getImageMargin(forToolbox)));
        imageSize = Math.min(w, imageSize);
        return new Size(imageSize, imageSize);
    }
    protected getImageSizeByTextBlockSize(textBlockSize: Size): Size {
        return this.getImageSize(new Size(textBlockSize.width, Number.MAX_VALUE), true);
    }
}
