import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { IApiController } from "./Api/ApiController";

export interface IKeyOwner {
    key: string;
}

export interface IShapeNode extends IKeyOwner {
    size: Size;
}

export interface ICustomShape {
    category: string;
    type: string;
    baseType?: string;
    title: string;
    svgUrl?: string;
    svgToolboxUrl?: string;
    svgLeft?: number;
    svgTop?: number;
    svgWidth?: number;
    svgHeight?: number;
    defaultWidth?: number;
    defaultHeight?: number;
    toolboxWidthToHeightRatio?: number;
    allowResize?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    defaultText?: string;
    allowEditText?: boolean;
    textLeft?: number;
    textTop?: number;
    textWidth?: number;
    textHeight?: number;
    defaultImageUrl?: string;
    allowEditImage?: boolean;
    imageLeft?: number;
    imageTop?: number;
    imageWidth?: number;
    imageHeight?: number;
    connectionPoints?: Point[];
    createTemplate?: (container: any, data: any) => void;
    createToolboxTemplate?: (container: any, data: any) => void;
    destroyTemplate?: (container: any) => void;
    templateLeft?: number;
    templateTop?: number;
    templateWidth?: number;
    templateHeight?: number;
    keepRatioOnAutoSize?: boolean;

    apiController?: IApiController;
}
