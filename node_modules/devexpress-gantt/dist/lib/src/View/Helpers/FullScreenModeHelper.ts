import { Browser } from "@devexpress/utils/lib/browser";
import { AttrUtils } from "@devexpress/utils/lib/utils/attr";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { FullScreenHelperSettings } from "../Settings/InitSettings/FullScreenHelperSettings";


export class FullScreenModeHelper {
    private settings: FullScreenHelperSettings;
    private _isInFullScreenMode: boolean = false;
    private fullScreenTempVars: any = {};

    public get isInFullScreenMode(): boolean { return this._isInFullScreenMode; }

    constructor(settings: FullScreenHelperSettings) {
        this.settings = settings;
    }

    private getMainElement(): HTMLElement {
        return this.settings.getMainElement();
    }
    private adjustControl(): void {
        this.settings.adjustControl();
    }

    public toggle(): boolean {
        this._isInFullScreenMode = !this._isInFullScreenMode;
        if(this._isInFullScreenMode)
            this.setFullScreenMode();
        else
            this.setNormalMode();
        return true;
    }
    private setFullScreenMode() {
        this.prepareFullScreenMode();
        this.adjustControlInFullScreenMode();
    }
    private prepareFullScreenMode() {
        const mainElement = this.getMainElement();
        AttrUtils.changeElementStyleAttribute(mainElement, "border-top-width", "0px");
        AttrUtils.changeElementStyleAttribute(mainElement, "border-left-width", "0px");
        AttrUtils.changeElementStyleAttribute(mainElement, "border-right-width", "0px");
        AttrUtils.changeElementStyleAttribute(mainElement, "border-bottom-width", "0px");
        this.fullScreenTempVars.scrollTop = DomUtils.getDocumentScrollTop();
        this.fullScreenTempVars.scrollLeft = DomUtils.getDocumentScrollLeft();
        AttrUtils.changeElementStyleAttribute(mainElement, "background-color", "white");
        AttrUtils.changeElementStyleAttribute(mainElement, "position", "fixed");
        AttrUtils.changeElementStyleAttribute(mainElement, "top", "0px");
        AttrUtils.changeElementStyleAttribute(mainElement, "left", "0px");
        AttrUtils.changeElementStyleAttribute(mainElement, "z-index", "1010");
        AttrUtils.changeElementStyleAttribute(document.documentElement, "position", "static");
        AttrUtils.changeElementStyleAttribute(document.documentElement, "overflow", "hidden");
        this.fullScreenTempVars.bodyMargin = document.body.style.margin;
        document.body.style.margin = "0";
        this.fullScreenTempVars.width = mainElement.style.width;
        this.fullScreenTempVars.height = mainElement.style.height || mainElement.clientHeight;
        if(window.self !== window.top)
            this.requestFullScreen(document.body);
    }
    private setNormalMode() {
        this.cancelFullScreen(document);
        const mainElement = this.getMainElement();
        AttrUtils.restoreElementStyleAttribute(mainElement, "left");
        AttrUtils.restoreElementStyleAttribute(mainElement, "top");
        AttrUtils.restoreElementStyleAttribute(mainElement, "background-color");
        AttrUtils.restoreElementStyleAttribute(document.documentElement, "overflow");
        AttrUtils.restoreElementStyleAttribute(document.documentElement, "position");
        AttrUtils.restoreElementStyleAttribute(mainElement, "z-index");
        document.body.style.margin = this.fullScreenTempVars.bodyMargin;
        AttrUtils.restoreElementStyleAttribute(mainElement, "position");
        AttrUtils.restoreElementStyleAttribute(mainElement, "border-top-width");
        AttrUtils.restoreElementStyleAttribute(mainElement, "border-left-width");
        AttrUtils.restoreElementStyleAttribute(mainElement, "border-right-width");
        AttrUtils.restoreElementStyleAttribute(mainElement, "border-bottom-width");
        this.setHeight(this.fullScreenTempVars.height);
        this.setWidth(this.fullScreenTempVars.width);
        document.documentElement.scrollTop = this.fullScreenTempVars.scrollTop;
        document.documentElement.scrollLeft = this.fullScreenTempVars.scrollLeft;
        this.adjustControl();
    }
    public adjustControlInFullScreenMode(): void {
        const documentWidth = document.documentElement.clientWidth == 0 ? document.body.clientWidth : document.documentElement.clientWidth;
        const documentHeight = document.documentElement.clientHeight == 0 ? document.body.clientHeight : document.documentElement.clientHeight;
        this.setWidth(documentWidth);
        this.setHeight(documentHeight);
        this.adjustControl();
    }
    private requestFullScreen(element): void {
        if(element.requestFullscreen)
            element.requestFullscreen();
        else if(element.mozRequestFullScreen)
            element.mozRequestFullScreen();
        else if(element.webkitRequestFullscreen)
            element.webkitRequestFullscreen();
        else if(element.msRequestFullscreen)
            element.msRequestFullscreen();
    }
    private cancelFullScreen(document): void {
        if(Browser.Firefox && !this.getFullScreenElement(document))
            return;

        if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();
        else if(document.msExitFullscreen)
            document.msExitFullscreen();
        else if(document.exitFullscreen)
            document.exitFullscreen();
    }
    private getFullScreenElement(document) {
        return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    }
    private setWidth(width: any): void {
        const mainElement = this.getMainElement();
        mainElement.style.width = this.isNumber(width) ? width + "px" : width;
    }
    private setHeight(height: any): void {
        const mainElement = this.getMainElement();
        mainElement.style.height = this.isNumber(height) ? height + "px" : height;
    }

    private isNumber(str): boolean {
        return !isNaN(parseFloat(str)) && isFinite(str);
    }
}
