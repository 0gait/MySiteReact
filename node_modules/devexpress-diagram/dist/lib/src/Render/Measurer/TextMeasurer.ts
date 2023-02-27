import { Size } from "@devexpress/utils/lib/geometry/size";
import { StyleBase } from "../../Model/Style";
import { DiagramItem } from "../../Model/DiagramItem";
import { RenderUtils } from "../Utils";
import { Shape } from "../../Model/Shapes/Shape";
import { Connector } from "../../Model/Connectors/Connector";
import { ITextMeasurer, TextOwner } from "./ITextMeasurer";
import { RenderHelper, svgNS } from "../RenderHelper";
import { IDOMManipulator } from "../DOMManipulator";
import { textToWords, ITextMeasureResult, getTextLineSize } from "../../Utils/TextUtils";

declare type MeasurerCache = { [hash: string]: Size };
declare type MeasurerFontSizeCache = { [hash: string]: number };
declare type MeasurerSet = { [hash: string]: boolean };

export class TextMeasurer implements ITextMeasurer {
    private cache: MeasurerCache = {};
    private fontSizeCache: MeasurerFontSizeCache = {};
    private containers: { [owner: number]: SVGGElement } = {};
    private parent: HTMLElement;
    private mainElement: HTMLElement;
    private svgElement: SVGSVGElement;

    constructor(parent: HTMLElement) {
        this.parent = parent;
        this.createNodes();
    }

    measureWords(text: string[] | string, style: StyleBase, owner: TextOwner): ITextMeasureResult {
        const result: ITextMeasureResult = { words: {}, fontSize: -1 };
        const words = typeof text === "string" ? this.splitToWords(text, false) : text.reduce((acc, t) => acc.concat(this.splitToWords(t, false)), []);
        words.push(" ");
        const styleHashKey = this.getStyleHash(style, owner);
        const measureElements = this.tryLoadWordsToMeasurer(words, style, styleHashKey, owner, undefined, undefined, undefined, undefined, result);
        if(measureElements) {
            const container = this.containers[owner];
            this.putElementsInDOM(container, measureElements);
            this.beforeMeasureInDOM();
            this.measureElementsInDOM(measureElements, result);
            this.afterMeasureInDOM();
        }
        return result;
    }

    measureTextLine(textLine: string, style: StyleBase, owner: TextOwner): Size {
        const results = this.measureWords(textLine, style, owner);
        return getTextLineSize(textLine, results);
    }

    onNewModel(items: DiagramItem[], dom: IDOMManipulator): void {
        dom.changeByFunc(null, () => this.onNewModelCore(items));
    }

    private onNewModelCore(items: DiagramItem[]) {
        const shapes: Shape[] = items.filter((i): i is Shape => i instanceof Shape);
        const connectors = items.filter((i): i is Connector => i instanceof Connector);

        const shapeElements = this.tryLoadShapeTexts(shapes);
        const connectorElements = this.tryLoadConnectorTexts(connectors);

        if(shapeElements || connectorElements) {
            shapeElements && this.putElementsInDOM(this.containers[TextOwner.Shape], shapeElements);
            connectorElements && this.putElementsInDOM(this.containers[TextOwner.Connector], connectorElements);

            this.beforeMeasureInDOM();
            shapeElements && this.measureElementsInDOM(shapeElements);
            connectorElements && this.measureElementsInDOM(connectorElements);
            this.afterMeasureInDOM();
        }
    }

    replaceParent(parent: HTMLElement): void {
        if(this.parent !== parent) {
            if(this.mainElement.parentNode)
                parent.appendChild(this.mainElement);
            this.parent = parent;
        }
    }
    clean(): void {
        RenderUtils.removeElement(this.mainElement);
    }

    private tryLoadShapeTexts(shapes: Shape[]): IMeasureElements {
        const newSet = {};
        const elements: SVGTextElement[] = [];
        const hashes: string[] = [];
        const styleHashes: string[] = [];
        shapes.forEach(s => {
            const styleHashKey = this.getStyleHash(s.styleText, TextOwner.Shape);
            this.tryLoadWordsToMeasurer(this.splitToWords(s.text, true), s.styleText, styleHashKey, TextOwner.Shape, newSet, elements, hashes, styleHashes);
        });
        return elements.length ? { elements: elements, hashes: hashes, styleHashes: styleHashes } : null;
    }
    private tryLoadConnectorTexts(connectors: Connector[]): IMeasureElements {
        const newSet = {};
        const elements: SVGTextElement[] = [];
        const hashes: string[] = [];
        const styleHashes: string[] = [];
        connectors.forEach(c => {
            const words = c.texts.map(t => t.value).reduce((acc, text) => acc.concat(this.splitToWords(text, false)), []);
            if(words.length) {
                words.push(" ");
                const styleHashKey = this.getStyleHash(c.styleText, TextOwner.Connector);
                this.tryLoadWordsToMeasurer(words, c.styleText, styleHashKey, TextOwner.Connector, newSet, elements, hashes, styleHashes);
            }
        });
        return elements.length ? { elements: elements, hashes: hashes, styleHashes: styleHashes } : null;
    }
    private tryLoadWordsToMeasurer(words: string[], style: StyleBase, styleHashKey: string, textOwner: TextOwner, newSet?: MeasurerSet, elementsToMeasure?: SVGTextElement[], hashesToMeasure?: string[], styleHashesToMeasure?: string[], result?: ITextMeasureResult): IMeasureElements {
        const newWords: string[] = [];
        elementsToMeasure = elementsToMeasure || [];
        hashesToMeasure = hashesToMeasure || [];
        styleHashesToMeasure = styleHashesToMeasure || [];
        newSet = newSet || {};
        words.forEach(t => this.tryLoadWordToMeasurer(t, style, styleHashKey, textOwner, newSet, elementsToMeasure, hashesToMeasure, styleHashesToMeasure, newWords, result));
        return elementsToMeasure.length ? { elements: elementsToMeasure, hashes: hashesToMeasure, styleHashes: styleHashesToMeasure, newWords: newWords } : null;
    }

    private putElementsInDOM(container: SVGGElement, measureElements: IMeasureElements) {
        container.parentNode && container.parentNode.removeChild(container);
        while(container.firstChild)
            container.removeChild(container.firstChild);
        measureElements.elements.forEach(el => container.appendChild(el));
        this.svgElement.appendChild(container);
    }
    private measureElementsInDOM(measureElements: IMeasureElements, result?: ITextMeasureResult) {
        const hashes = measureElements.hashes;
        const elements = measureElements.elements;
        const words = measureElements.newWords;
        const count = hashes.length;
        for(let i = 0; i < count; i++) {
            const size = this.getDomElementSize(elements[i]);
            if(size) {
                if(!size.isEmpty())
                    this.cache[hashes[i]] = size;
                if(result)
                    result.words[words[i]] = size;
            }
            const styleHashKey = measureElements.styleHashes[i];
            if(this.fontSizeCache[styleHashKey] === undefined)
                this.fontSizeCache[styleHashKey] = this.getDomFontSize(elements[i]);
            if(result && result.fontSize < 0)
                result.fontSize = this.fontSizeCache[styleHashKey];
        }
    }
    private beforeMeasureInDOM() {
        this.parent.appendChild(this.mainElement);
    }
    private afterMeasureInDOM() {
        this.mainElement.parentNode && this.mainElement.parentNode.removeChild(this.mainElement);
    }

    private tryLoadWordToMeasurer(word: string, style: StyleBase, styleHashKey: string, owner: TextOwner, newSet: MeasurerSet, elementsToMeasure: SVGTextElement[], hashesToMeasure: string[], styleHashesToMeasure: string[], newWords: string[], result?: ITextMeasureResult) {
        const hash = this.getHash(word, style, owner);
        const cachedSize = this.cache[hash];
        if(!cachedSize && !newSet[hash]) {
            newSet[hash] = true;
            hashesToMeasure.push(hash);
            elementsToMeasure.push(this.createElement(word, style));
            styleHashesToMeasure.push(styleHashKey);
            newWords.push(word);
        }
        else if(cachedSize && result) {
            result.words[word] = cachedSize;
            result.fontSize = this.fontSizeCache[styleHashKey];
        }
    }
    private getHash(text: string, style: StyleBase, owner: TextOwner): string {
        return owner + "|" + (style && style.toHash()) + "|" + text;
    }
    private getStyleHash(style: StyleBase, owner: TextOwner): string {
        return this.getHash(" ", style, owner);
    }
    private createElement(text: string, style: StyleBase): SVGTextElement {
        const element = document.createElementNS(svgNS, "text");
        if(text === " ")
            element.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");

        element.textContent = text;
        style && RenderUtils.applyStyleToElement(style, element);
        return element;
    }

    private splitToWords(text: string, includeWhitespace: boolean): string[] {
        const words = textToWords(text);
        includeWhitespace && words.push(" ");
        return words;
    }

    getDomFontSize(textEl: SVGTextElement): number { 
        return parseFloat(window.getComputedStyle(textEl).fontSize);
    }
    getDomElementSize(textEl: SVGTextElement): Size | null { 
        let bBox;
        try {
            bBox = textEl.getBBox();
        }
        catch{ } 
        return bBox ? new Size(bBox.width, bBox.height) : new Size(0, 0);
    }

    private createNodes() {
        this.mainElement = RenderHelper.createMainElement(undefined, true);
        this.svgElement = RenderHelper.createSvgElement(this.mainElement, false);
        this.createContainer(TextOwner.Shape, "shape");
        this.createContainer(TextOwner.Connector, "connector");
        this.createContainer(TextOwner.ExtensionLine, "extension-line");
        this.createContainer(TextOwner.Resize, "resize-info");
    }
    private createContainer(owner: TextOwner, className: string) {
        const element = document.createElementNS(svgNS, "g");
        element.setAttribute("class", className);
        this.containers[owner] = element;
    }
}

interface IMeasureElements {
    hashes: string[];
    elements: SVGTextElement[];
    styleHashes: string[];
    newWords?: string[];
}
