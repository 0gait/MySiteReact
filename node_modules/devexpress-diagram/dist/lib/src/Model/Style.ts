import { ColorUtils } from "@devexpress/utils/lib/utils/color";
import { isColorProperty } from "../Utils/Svg";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";

export abstract class StyleBase {
    constructor() {
        this.createDefaultProperties();
    }

    clone(): StyleBase {
        const style = this.createInstance();
        this.forEach(propertyName => { style[propertyName] = this[propertyName]; });
        return style;
    }
    forEach(callback: (propertyName) => void) {
        for(const propertyName in this)
            if(Object.prototype.hasOwnProperty.call(this, propertyName))
                callback(propertyName);

    }
    abstract createInstance(): StyleBase;
    abstract createDefaultProperties();
    abstract getDefaultInstance(): StyleBase;

    get strokeWidthPx(): number {
        return 0;
    }
    get strokeWidth(): number {
        return UnitConverter.pixelsToTwips(this.strokeWidthPx);
    }
    get strokeOffset(): number {
        return 0.5;
    }

    toHash(): string {
        const obj = this.toObject();
        return !obj ? "" : Object.keys(obj).map(k => k + "|" + obj[k]).join("");
    }
    toObject() {
        const result = {};
        let modified = false;
        const defaultStyle = this.getDefaultInstance();
        this.forEach(key => {
            if(this[key] !== defaultStyle[key]) {
                result[key] = this[key];
                modified = true;
            }
        });
        return modified ? result : null;
    }
    fromObject(obj: any) {
        for(const key in obj)
            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = isColorProperty(key) ? ColorUtils.stringToHash(obj[key]) : obj[key];
                this[key] = value;
            }
    }
}

export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_STROKE_DASHARRAY = "";

export class Style extends StyleBase {
    static readonly defaultInstance = new Style();

    createInstance(): StyleBase {
        return new Style();
    }
    createDefaultProperties() {
        this["fill"] = "#ffffff";
        this["stroke"] = "#000000";
        this["stroke-width"] = DEFAULT_STROKE_WIDTH.toString();
        this["stroke-dasharray"] = DEFAULT_STROKE_DASHARRAY;
    }
    getDefaultInstance(): StyleBase {
        return Style.defaultInstance;
    }
    isDefaultStrokeDashArray(): boolean {
        return this["stroke-dasharray"] === DEFAULT_STROKE_DASHARRAY;
    }
    resetStrokeDashArray() {
        this["stroke-dasharray"] = DEFAULT_STROKE_DASHARRAY;
    }
    get strokeWidthPx(): number {
        return parseInt(this["stroke-width"]);
    }
}

export class TextStyle extends StyleBase {
    static readonly defaultInstance = new TextStyle();

    createInstance(): StyleBase {
        return new TextStyle();
    }
    createDefaultProperties() {
        this["fill"] = "#000000";
        this["font-family"] = "Arial";
        this["font-size"] = "10pt";
        this["font-weight"] = "";
        this["font-style"] = "";
        this["text-decoration"] = "";
        this["text-anchor"] = "middle";
    }
    getDefaultInstance(): StyleBase {
        return TextStyle.defaultInstance;
    }
    getAlignment(): TextAlignment {
        switch(this["text-anchor"]) {
            case "left":
                return TextAlignment.Left;
            case "right":
                return TextAlignment.Right;
            default:
                return TextAlignment.Center;
        }
    }
}

export enum TextAlignment {
    Left,
    Right,
    Center
}

export class StrokeStyle extends Style {
    private _strokeWidthPx: number;
    private _strokeOffset: number;

    static readonly default1pxInstance = new StrokeStyle(1, 0.5);
    static readonly default1pxNegativeOffsetInstance = new StrokeStyle(1, -0.5);
    static readonly default2pxInstance = new StrokeStyle(2);

    constructor(strokeWidthPx?: number, strokeOffset?: number) {
        super();
        this._strokeWidthPx = strokeWidthPx;
        this._strokeOffset = strokeOffset;
    }
    createInstance(): StyleBase {
        return new StrokeStyle();
    }
    createDefaultProperties() {
    }
    getDefaultInstance(): StyleBase {
        return TextStyle.defaultInstance;
    }

    get strokeWidthPx(): number {
        return this._strokeWidthPx || 0;
    }
    get strokeOffset(): number {
        return this._strokeOffset || 0;
    }
}

export class EmptyStyle extends Style {
    static readonly defaultInstance = new EmptyStyle();

    constructor(styles?: {[key: string]: string}) {
        super();
        if(styles)
            Object.keys(styles).forEach(k => this[k] = styles[k]);
    }
    createInstance(): StyleBase {
        return new EmptyStyle();
    }
    createDefaultProperties() {
    }
    getDefaultInstance(): StyleBase {
        return TextStyle.defaultInstance;
    }
}
