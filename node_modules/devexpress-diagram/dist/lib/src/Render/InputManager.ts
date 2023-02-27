import { KeyUtils } from "@devexpress/utils/lib/utils/key";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { TextStyle } from "../Model/Style";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { RenderUtils, raiseEvent } from "./Utils";
import { ITextInputOperationListener, DiagramKeyboardEvent, DiagramFocusEvent, DiagramClipboardEvent } from "../Events/Event";
import { DiagramItem } from "../Model/DiagramItem";
import { Shape } from "../Model/Shapes/Shape";
import { Connector } from "../Model/Connectors/Connector";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { IEventManager } from "../Events/EventManager";

import { ILayoutPointResolver } from "./CanvasItemsManager";
import { ICanvasViewListener } from "./CanvasViewManager";
import { TextAngle } from "./Primitives/TextPrimitive";
import { ITextMeasurer, TextOwner } from "./Measurer/ITextMeasurer";
import { Browser } from "@devexpress/utils/lib/browser";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { RenderHelper } from "./RenderHelper";
import { getTextHeight, getLineHeight, textToParagraphs } from "../Utils/TextUtils";
import { HtmlFocusUtils } from "../Utils";

const TEXT_INPUT_CSSCLASS = "dxdi-text-input";

export class InputManager implements ITextInputOperationListener, ICanvasViewListener {
    textInputElementContainer: HTMLDivElement;
    mouseWheelHandler: (evt: WheelEvent) => void;

    private inputElement: HTMLTextAreaElement;
    private textInputElement: HTMLTextAreaElement;
    private clipboardInputElement: HTMLTextAreaElement;
    private focused = false;
    private focusLocked: boolean = false;

    private savedTextInputPosition: Point;
    private savedTextInputSize: Size;
    private savedTextInputAngle: TextAngle;
    private savedTextInputStyle: TextStyle;

    private onInputBlurHandler: any;
    private onInputFocusHandler: any;
    private onInputKeyDownHandler: any;
    private onInputKeyPressHandler: any;
    private onInputKeyUpHandler: any;
    private onTextInputMouseWheelHandler: any;
    private onTextInputMouseUpHandler: any;
    private onTextInputBlurHandler: any;
    private onTextInputFocusHandler: any;
    private onTextInputKeyDownHandler: any;
    private onTextInputKeyUpHandler: any;
    private onTextInputChangeHandler: any;
    private onPasteHandler: any;

    constructor(
        private mainElement: HTMLElement,
        private layoutPointResolver: ILayoutPointResolver,
        private eventManager: IEventManager,
        private textMeasurer: ITextMeasurer,
        public actualZoom: number,
        private focusElementsParent?: HTMLElement
    ) {
        this.createInputElements(this.mainElement, this.focusElementsParent);
    }
    detachEvents() {
        this.detachInputElementEvents();
        this.detachTextInputElementEvents();
    }

    isFocused() {
        return this.focused;
    }
    captureFocus(keepTextInputFocused?: boolean) {
        if(keepTextInputFocused && document.activeElement === this.textInputElement)
            HtmlFocusUtils.focusWithPreventScroll(this.textInputElement || this.inputElement);
        else
            HtmlFocusUtils.focusWithPreventScroll(this.inputElement);
    }

    setClipboardData(data: string) {
        this.clipboardInputElement.value = data;
        HtmlFocusUtils.focusWithPreventScroll(this.clipboardInputElement);
        this.clipboardInputElement.select();
        document.execCommand("copy");
        this.captureFocus();
    }
    getClipboardData(callback: (data: string) => void) {
        if(navigator && navigator["clipboard"])
            navigator["clipboard"].readText().then(clipText => {
                callback(clipText);
                this.captureFocus();
            }).catch(() => {
                callback("");
                this.captureFocus();
            });

        else if(Browser.IE) {
            this.clipboardInputElement.value = "";
            HtmlFocusUtils.focusWithPreventScroll(this.clipboardInputElement);
            this.clipboardInputElement.select();
            document.execCommand("Paste");
            callback(this.clipboardInputElement.value);
            this.captureFocus();
        }
    }
    isPasteSupportedByBrowser() {
        return Browser.IE || (Browser.WebKitFamily && navigator && navigator["clipboard"] !== undefined);
    }

    private createInputElements(parent: HTMLElement, focusElementsParent: HTMLElement) {
        this.createFocusInputElement(focusElementsParent || parent);
        this.createTextInputElement(parent);
        this.createClipboardInputElement(focusElementsParent || parent);
        this.attachInputElementEvents();
    }

    private setInputElementFocusHandlerMode(captureFocus?: boolean) {
        this.textInputElementContainer.setAttribute("class", "dxdi-text-input-container");
        if(captureFocus)
            this.captureFocus();
    }
    private setInputElementTextInputMode(text: string, position: Point, size: Size, style: TextStyle,
        className: string, textAngle: TextAngle) {
        this.textInputElementContainer.setAttribute("class", "dxdi-text-input-container " + className);
        this.textInputElement.value = text;

        this.setTextInputElementBounds(position, size, textAngle);
        this.setTextInputElementStyle(style);
        this.updateTextInputPadding();

        const element = this.textInputElement || this.inputElement;
        HtmlFocusUtils.focusWithPreventScroll(element);
        if(element.select)
            element.select();
    }
    private setTextInputElementBounds(position: Point, size: Size, textAngle: TextAngle) {
        this.savedTextInputPosition = position;
        this.savedTextInputSize = size;
        this.savedTextInputAngle = textAngle;

        const abs = this.layoutPointResolver.getAbsolutePoint(position, true);

        this.textInputElementContainer.style.left = abs.x + "px";
        this.textInputElementContainer.style.top = abs.y + "px";
        this.textInputElementContainer.style.width = size && size.width + "px" || "0px";
        this.textInputElementContainer.style.height = size && size.height + "px" || "0px";

        const transforms = [];
        this.textInputElementContainer.style.transform = "";
        if(this.actualZoom !== 1)
            transforms.push("scale(" + this.actualZoom + ")");
        if(textAngle)
            transforms.push("rotate(" + textAngle + "deg)");
        this.textInputElementContainer.style.transform = transforms.join(" ");

        this.textInputElement.style.width = size && size.width + "px" || "";
        this.textInputElement.style.height = size && size.height + "px" || "auto";
    }
    private setTextInputElementStyle(style: TextStyle) {
        this.savedTextInputStyle = style;
        RenderUtils.applyStyleToElement(style, this.textInputElement);
    }

    private createFocusInputElement(parent: HTMLElement) {
        this.inputElement = document.createElement("textarea");
        this.inputElement.readOnly = Browser.TouchUI; 
        this.inputElement.setAttribute("class", "dxdi-focus-input");
        parent.appendChild(this.inputElement);
    }
    private attachInputElementEvents() {
        this.onInputBlurHandler = this.onInputBlur.bind(this);
        this.onInputFocusHandler = this.onInputFocus.bind(this);
        this.onInputKeyDownHandler = this.onInputKeyDown.bind(this);
        this.onInputKeyPressHandler = this.onInputKeyPress.bind(this);
        this.onInputKeyUpHandler = this.onInputKeyUp.bind(this);
        this.onPasteHandler = this.onPaste.bind(this);

        RenderHelper.addEventListener(this.inputElement, "blur", this.onInputBlurHandler);
        RenderHelper.addEventListener(this.inputElement, "focus", this.onInputFocusHandler);
        RenderHelper.addEventListener(this.inputElement, "keydown", this.onInputKeyDownHandler);
        RenderHelper.addEventListener(this.inputElement, "keypress", this.onInputKeyPressHandler);
        RenderHelper.addEventListener(this.inputElement, "keyup", this.onInputKeyUpHandler);
        RenderHelper.addEventListener(this.inputElement, "paste", this.onPasteHandler);

    }
    private detachInputElementEvents() {
        RenderHelper.removeEventListener(this.inputElement, "blur", this.onInputBlurHandler);
        RenderHelper.removeEventListener(this.inputElement, "focus", this.onInputFocusHandler);
        RenderHelper.removeEventListener(this.inputElement, "keydown", this.onInputKeyDownHandler);
        RenderHelper.removeEventListener(this.inputElement, "keypress", this.onInputKeyPressHandler);
        RenderHelper.removeEventListener(this.inputElement, "keyup", this.onInputKeyUpHandler);
        RenderHelper.removeEventListener(this.inputElement, "paste", this.onPasteHandler);
    }
    private createTextInputElement(parent: HTMLElement) {
        this.textInputElementContainer = document.createElement("div");
        this.textInputElementContainer.setAttribute("class", "dxdi-text-input-container");
        parent.appendChild(this.textInputElementContainer);
        this.textInputElement = document.createElement("textarea");
        this.textInputElement.setAttribute("class", TEXT_INPUT_CSSCLASS);
        this.attachTextInputElementEvents();
        this.textInputElementContainer.appendChild(this.textInputElement);
    }
    private attachTextInputElementEvents() {
        this.onTextInputBlurHandler = this.onTextInputBlur.bind(this);
        this.onTextInputFocusHandler = this.onTextInputFocus.bind(this);
        this.onTextInputKeyDownHandler = this.onTextInputKeyDown.bind(this);
        this.onTextInputMouseWheelHandler = this.onTextInputMouseWheel.bind(this);
        this.onTextInputMouseUpHandler = this.onTextInputMouseUp.bind(this);
        this.onTextInputKeyUpHandler = this.onTextInputKeyUp.bind(this);
        this.onTextInputChangeHandler = this.onTextInputChange.bind(this);

        RenderHelper.addEventListener(this.textInputElement, "mousewheel", this.onTextInputMouseWheelHandler);
        RenderHelper.addEventListener(this.textInputElement, "mouseup", this.onTextInputMouseUpHandler);
        RenderHelper.addEventListener(this.textInputElement, "blur", this.onTextInputBlurHandler);
        RenderHelper.addEventListener(this.textInputElement, "focus", this.onTextInputFocusHandler);
        RenderHelper.addEventListener(this.textInputElement, "keydown", this.onTextInputKeyDownHandler);
        RenderHelper.addEventListener(this.textInputElement, "keyup", this.onTextInputKeyUpHandler);
        RenderHelper.addEventListener(this.textInputElement, "change", this.onTextInputChangeHandler);
    }
    private detachTextInputElementEvents() {
        RenderHelper.removeEventListener(this.textInputElement, "mousewheel", this.onTextInputMouseWheelHandler);
        RenderHelper.removeEventListener(this.textInputElement, "mouseup", this.onTextInputMouseUpHandler);
        RenderHelper.removeEventListener(this.textInputElement, "blur", this.onTextInputBlurHandler);
        RenderHelper.removeEventListener(this.textInputElement, "focus", this.onTextInputFocusHandler);
        RenderHelper.removeEventListener(this.textInputElement, "keydown", this.onTextInputKeyDownHandler);
        RenderHelper.removeEventListener(this.textInputElement, "keyup", this.onTextInputKeyUpHandler);
        RenderHelper.removeEventListener(this.textInputElement, "change", this.onTextInputChangeHandler);
    }
    private createClipboardInputElement(parent: HTMLElement) {
        this.clipboardInputElement = document.createElement("textarea");
        this.clipboardInputElement.setAttribute("class", "dxdi-clipboard-input");
        parent.appendChild(this.clipboardInputElement);
    }

    private blurControl() {
        if(!this.focusLocked) {
            this.focused = false;
            DomUtils.removeClassName(this.mainElement, "focused");
        }
    }
    private focusControl() {
        this.focused = true;
        this.focusLocked = false;
        DomUtils.addClassName(this.mainElement, "focused");
    }
    private updateTextInputPadding() {
        const text = this.textInputElement.value;
        if(!this.savedTextInputSize) {
            const measureResults = this.textMeasurer.measureWords(" ", this.savedTextInputStyle, TextOwner.Connector);
            const textHeight = getLineHeight(measureResults) * ((textToParagraphs(text).length || 1) + 1);
            this.textInputElement.style.height = Math.ceil(textHeight) + "px";
        }
        else {
            const measureResults = this.textMeasurer.measureWords(text, this.savedTextInputStyle, TextOwner.Shape);
            const textHeight = getTextHeight(text, this.savedTextInputSize.width, measureResults, true);
            const top = Math.max(0, (this.savedTextInputSize.height - textHeight) * 0.5);
            this.textInputElement.style.paddingTop = Math.ceil(top) + "px";
            this.textInputElement.style.height = Math.floor(this.savedTextInputSize.height) + "px";
        }
    }

    private onInputBlur(evt: FocusEvent) {
        this.blurControl();
        raiseEvent(evt, this.getDiagramFocusEvent(evt), e => this.eventManager.onBlur(e));
    }
    private onInputFocus(evt: FocusEvent) {
        this.focusControl();
        raiseEvent(evt, this.getDiagramFocusEvent(evt), e => this.eventManager.onFocus(e));
    }
    private onInputKeyDown(evt: KeyboardEvent) {
        raiseEvent(evt, this.getDiagramKeyboardEvent(evt), e => this.eventManager.onKeyDown(e));
    }
    private onInputKeyPress(evt: KeyboardEvent) {
        if(evt.preventDefault && !(Browser.Safari && evt.code === "KeyV"))
            evt.preventDefault(); 
    }
    private onInputKeyUp(evt: KeyboardEvent) {
        raiseEvent(evt, this.getDiagramKeyboardEvent(evt), e => this.eventManager.onKeyUp(e));
    }
    private onTextInputBlur(evt: FocusEvent) {
        if(this.eventManager.canFinishTextEditing()) {
            this.blurControl();
            raiseEvent(evt, this.getDiagramFocusEvent(evt), e => this.eventManager.onTextInputBlur(e));
        }
        else {
            const srcElement = EvtUtils.getEventSource(evt);
            if(document.activeElement !== srcElement) 
                srcElement.focus();
        }
    }
    private onTextInputFocus(evt: FocusEvent) {
        this.focusControl();
        raiseEvent(evt, this.getDiagramFocusEvent(evt), e => this.eventManager.onTextInputFocus(e));
    }
    private onTextInputKeyDown(evt: KeyboardEvent) {
        raiseEvent(evt, this.getDiagramKeyboardEvent(evt), e => this.eventManager.onTextInputKeyDown(e));
    }
    private onTextInputKeyUp(evt: KeyboardEvent) {
        this.updateTextInputPadding();
    }
    private onTextInputChange(evt: KeyboardEvent) {
        this.updateTextInputPadding();
    }

    private onPaste(evt: ClipboardEvent) {
        raiseEvent(evt, this.getDiagramClipboardEvent(evt), e => this.eventManager.onPaste(e));
    }

    private onTextInputMouseWheel(evt: WheelEvent) {
        this.mouseWheelHandler && this.mouseWheelHandler(evt);
    }
    private onTextInputMouseUp(evt: MouseEvent) {
        if(evt.stopPropagation)
            evt.stopPropagation();
        EvtUtils.cancelBubble(evt);
    }

    private getDiagramKeyboardEvent(evt: KeyboardEvent) {
        return new DiagramKeyboardEvent(KeyUtils.getKeyModifiers(evt), KeyUtils.getEventKeyCode(evt), this.textInputElement.value); 
    }
    getTextInputElementValue(): string {
        return this.textInputElement.value;
    }
    private getDiagramFocusEvent(evt: FocusEvent) {
        return new DiagramFocusEvent((<HTMLTextAreaElement>evt.target).value);
    }
    private getDiagramClipboardEvent(evt: ClipboardEvent) {
        let clipboardData;
        const evtClipboardData = evt.clipboardData || (evt["originalEvent"] && evt["originalEvent"].clipboardData);
        if(evtClipboardData !== undefined)
            clipboardData = evtClipboardData.getData("text/plain");
        else
            clipboardData = window["clipboardData"].getData("Text");
        return new DiagramClipboardEvent(clipboardData);
    }

    isTextInputElement(element: HTMLElement) {
        return typeof element.className === "string" && element.className.indexOf(TEXT_INPUT_CSSCLASS) > -1;
    }

    lockFocus() {
        this.focusLocked = true;
        setTimeout(() => this.focusLocked = false, 10);
    }

    notifyViewAdjusted(canvasOffset: Point) { }
    notifyActualZoomChanged(actualZoom: number) {
        this.actualZoom = actualZoom;

        if(this.savedTextInputPosition && this.savedTextInputSize)
            this.setTextInputElementBounds(this.savedTextInputPosition, this.savedTextInputSize, this.savedTextInputAngle);
    }
    notifyTextInputStart(item: DiagramItem, text: string, position: Point, size?: Size): void {
        let className = "";
        let textAngle: TextAngle;
        if(item instanceof Shape) {
            className = "shape-text";
            textAngle = item.textAngle;
        }
        else if(item instanceof Connector)
            className = "connector-text";
        size = size && size.clone().applyConverter(UnitConverter.twipsToPixels);
        this.setInputElementTextInputMode(text, position, size, item.styleText, className, textAngle);
    }
    notifyTextInputEnd(item: DiagramItem, captureFocus?: boolean): void {
        this.setInputElementFocusHandlerMode(captureFocus);
    }
    notifyTextInputPermissionsCheck(item: DiagramItem, allowed: boolean): void {}
}
