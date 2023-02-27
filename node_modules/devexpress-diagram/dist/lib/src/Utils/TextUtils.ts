import { ITextMeasurer, TextOwner } from "../Render/Measurer/ITextMeasurer";
import { Range } from "../Utils";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { StyleBase } from "../Model/Style";
import { Data } from "./Data";

const WHITESPACES = /\s/gm;

export const LINE_HEIGHT = 1.05;

export interface ITextMeasureResult {
    words: { [ word: string ]: Size };
    fontSize: number;
}

export function wordsByLines(absLineWidth: number, words: string[], measureWords: () => ITextMeasureResult): string[] {
    if(words.length === 1)
        return words;
    const measuredWords = measureWords();
    const spaceWidth = measuredWords.words[" "].width;
    const result: string[] = [];
    let lastLineWidth = 0;
    let lastLineIndex = -1;
    for(let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordWidth = measuredWords.words[word].width;
        if(lastLineIndex === -1 || lastLineWidth + spaceWidth + wordWidth > absLineWidth) {
            lastLineIndex = result.push(word) - 1;
            lastLineWidth = wordWidth;
        }
        else {
            lastLineWidth += spaceWidth + wordWidth;
            result[lastLineIndex] += " " + word;
        }
    }
    return result;
}

export function textToWords(text: string): string[] {
    return text.split(WHITESPACES).filter(t => t.length);
}

export function textToParagraphs(text: string): string[] {
    return text.split("\n");
}
export const TEXTRECT_RATIO_EPS = 1.2;
const TEXTRECT_WIDTH_DIFF_EPS = 1;
export function getOptimalTextRectangle(text: string, style: StyleBase, owner: TextOwner, measurer: ITextMeasurer, initialSize: Size, keepRatio: boolean, minWidth = 0, maxWidth = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE, minHeight = 0, maxHeight = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE): Size {
    if(!text)
        return new Size(Data.byRange(initialSize.width, minWidth, maxWidth), Data.byRange(initialSize.height, minHeight, maxHeight));
    if(minWidth > maxWidth || minHeight > maxHeight)
        throw new Error("Min size cannot exceed max size");
    if(minWidth === maxWidth && minHeight === maxHeight)
        return new Size(minWidth, minHeight);
    const measureResult = measurer.measureWords(text, style, owner);
    const paragraphs = textToParagraphs(text);
    const maxWordWidth = Object.keys(measureResult.words).reduce((acc, word) => Math.max(acc, measureResult.words[word].width), 0);
    const xRange = new Range(Data.byRange(Math.max(initialSize.width, maxWordWidth), minWidth, maxWidth), maxWidth);
    const yRange = new Range(Data.byRange(initialSize.height, minHeight, maxHeight), maxHeight);
    if(maxWordWidth <= initialSize.width && getTextHeight(paragraphs, initialSize.width, measureResult, false) <= initialSize.height && xRange.includes(initialSize.width) && yRange.includes(initialSize.height))
        return initialSize;
    const ratio = initialSize.width / initialSize.height;
    return getOptimalTextRectangleCore(paragraphs, measureResult, ratio, xRange, yRange, keepRatio);
}

function getOptimalTextRectangleCore(paragraphs: string[], measureResult: ITextMeasureResult, initRatio: number, xRange: Range, yRange: Range, incHeightToRatio: boolean): Size {
    const maxParagraphWidth = paragraphs.reduce((acc, val) => Math.max(acc, getTextLineSize(val, measureResult).width), 0);
    let size = new Size(0, 0);
    const newSize = new Size(0, 0);
    let newFitToHeight: boolean;
    let deltaWidth: number = 0;
    let error = 0;
    for(let attempt = 0; attempt < 5; attempt++) {
        if(attempt === 0)
            [newSize.width] = calcByFit(maxParagraphWidth, xRange);
        else if(Math.abs(deltaWidth) > TEXTRECT_WIDTH_DIFF_EPS)
            [newSize.width] = calcByFit(size.width + deltaWidth, xRange);
        else
            break;
        [newSize.height, newFitToHeight] = calcHeight(paragraphs, newSize.width, measureResult, yRange);
        if(attempt === 0) {
            size = newSize.clone();
            error = (size.width / size.height) / initRatio;
        }
        if(attempt === 0 && !newFitToHeight) break;

        const newRatio = (newSize.width / newSize.height);
        const newError = newRatio / initRatio;

        if(attempt === 0)
            deltaWidth = (newSize.width / newError - newSize.width) / 2;
        else if(!newFitToHeight)
            deltaWidth /= 2;
        else if(!compareRatio(initRatio, newRatio, TEXTRECT_RATIO_EPS)) {
            size = newSize.clone();
            error = newError;
            break;
        }
        else if(compareRatio(error, newError, 1) < 0) {
            size = newSize.clone();
            error = newError;
            deltaWidth = (newSize.width / newError - newSize.width) / 2;
            if(newError < 1)
                deltaWidth /= 2;
        }
        else
            break;
    }
    if(incHeightToRatio)
        size.height = Data.byRange(size.width / initRatio, size.height, yRange.to);
    return size;
}

function compareRatio(a: number, b: number, eps: number): number {
    const an = a < 1 ? 1 / a : a;
    const bn = b < 1 ? 1 / b : b;
    const e = an / bn;
    const en = e < 1 ? 1 / e : e;
    return en <= eps ? 0 : bn > an ? 1 : -1;
}

function calcHeight(paragraphs: string[], width: number, measureResult: ITextMeasureResult, yRange: Range): [number, boolean] {
    const height = getTextHeight(paragraphs, width, measureResult, false);
    return calcByFit(height, yRange);
}

function calcByFit(value: number, range: Range): [number, boolean] {
    return [
        Data.byRange(value, range.from, range.to),
        value <= range.to
    ];
}

export function getTextLineSize(text: string, measureResult: ITextMeasureResult): Size {
    const words = textToWords(text);
    return words.reduce((acc, word, index) => {
        const wordSize = measureResult.words[word];
        acc.width += wordSize.width;
        acc.height = Math.max(acc.height, wordSize.height);
        if(index > 0)
            acc.width += measureResult.words[" "].width;
        return acc;
    }, new Size(0, 0));
}

export function getTextHeight(textOrParagraphs: string[] | string, width: number, measureResult: ITextMeasureResult, emptyTextAsSingleLine: boolean): number {
    const paragraphs = Array.isArray(textOrParagraphs) ? textOrParagraphs : textToParagraphs(textOrParagraphs);
    if(emptyTextAsSingleLine && (!paragraphs.length || (paragraphs.length === 1 && !paragraphs[0].length)))
        return getLineHeight(measureResult);
    return paragraphs.reduce((acc, line) => acc + wordsByLines(width, textToWords(line), () => measureResult).length, 0) * getLineHeight(measureResult);
}

export function getLineHeight(measureResult: ITextMeasureResult): number {
    return measureResult.fontSize * LINE_HEIGHT;
}
