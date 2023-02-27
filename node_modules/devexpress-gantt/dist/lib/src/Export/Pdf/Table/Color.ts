import { isDefined } from "@devexpress/utils/lib/utils/common";
import { IPdfTableValueProvider } from "./IPdfTableDataProvider";

export class Color implements IPdfTableValueProvider {
    static rgbRegexp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/;
    static rgbaRegexp = /rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*,?\s*([0-9]*\.?[0-9]*)\s*\)/;

    protected _num: number = null;
    protected _opacity: number = 1;
    protected _rgb: Array<number> = null;

    constructor(color?: string|number|Array<number>) {
        this.assign(color);
    }
    public get opacity(): number {
        return this._opacity;
    }
    public hasValue(): boolean {
        return isDefined(this._num) || !!this._rgb || this._opacity === 0;
    }
    public getValue(): boolean|string|number|Array<number> {
        if(this._opacity === 0 && !this._rgb)
            return false;
        if(isDefined(this._num))
            return this._num;
        if(this._rgb)
            return this.getRBGColor();
        return null;
    }
    public assign(source: boolean|string|number|Array<number>|Color): void {
        this.reset();
        if(typeof source === "string")
            this.assignFromString(source);
        if(typeof source === "number")
            this._num = source;
        if(source instanceof Array)
            this.assignFromRgbArray(source as Array<number>);
        if(source instanceof Color)
            this.assignFromColor(source);
    }
    public reset():void {
        this._opacity = 1;
        this._num = null;
        this._rgb = null;
    }

    public assignFromString(color: string): void {
        if(!color)
            return;
        if(color === "transparent")
            this._opacity = 0;
        if(color.indexOf("#") === 0)
            this.assignFromHexString(color);
        if(color.substr(0, 3).toLowerCase() === "rgb")
            this.assignFromRgbString(color);
    }
    private assignFromHexString(hex: string) {
        if(hex.length === 4)
            hex = "#" + hex[1].repeat(2) + hex[2].repeat(2) + hex[3].repeat(2);
        if(hex.length > 6) {
            const r = parseInt(hex.substr(1, 2), 16);
            const g = parseInt(hex.substr(3, 2), 16);
            const b = parseInt(hex.substr(5, 2), 16);
            this._rgb = [r, g, b];
        }
    }
    private assignFromRgbString(rgb: string): any {
        const isRGBA = rgb.substr(0, 4).toLowerCase() === "rgba";
        const regResult = rgb.toLowerCase().match(isRGBA ? Color.rgbaRegexp : Color.rgbRegexp);
        if(regResult) {
            const r = parseInt(regResult[1]);
            const g = parseInt(regResult[2]);
            const b = parseInt(regResult[3]);
            this._rgb = [r, g, b];
            if(isRGBA)
                this._opacity = parseFloat(regResult[4]);
        }
    }
    private assignFromRgbArray(rgb: Array<number>): any {
        if(rgb && rgb.length > 2) {
            this._rgb = [rgb[0], rgb[1], rgb[2]];
            if(isDefined(rgb[3]))
                this._opacity = rgb[3];
        }
    }
    private assignFromColor(source: Color): void {
        this._opacity = source._opacity;
        this._num = source._num;
        this._rgb = source._rgb;
    }
    public getRBGColor(): Array<number> {
        return this._rgb ? this._rgb : [0, 0, 0];
    }
    public applyOpacityToBackground(source: Color|string|Array<number>): void {
        if(this._opacity === 1)
            return;
        const background = source instanceof Color ? source : new Color(source);
        const backRGB = background.getValue();
        if(backRGB instanceof Array) {
            const alpha = this.opacity;
            const r = Math.round((1 - alpha) * backRGB[0] + alpha * this._rgb[0]);
            const g = Math.round((1 - alpha) * backRGB[1] + alpha * this._rgb[1]);
            const b = Math.round((1 - alpha) * backRGB[2] + alpha * this._rgb[2]);
            this._rgb = [ r, g, b];
        }
    }
}
