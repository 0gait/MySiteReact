import { EventDispatcher } from "../../Utils";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { IVisualizersListener } from "../EventManager";

export enum ExtensionLineType {
    LeftToLeftAbove, LeftToLeftBelow, RightToRightAbove, RightToRightBelow,
    LeftToRightAbove, LeftToRightBelow, RightToLeftAbove, RightToLeftBelow,
    TopToTopBefore, TopToTopAfter, BottomToBottomBefore, BottomToBottomAfter,
    TopToBottomBefore, TopToBottomAfter, BottomToTopBefore, BottomToTopAfter,
    HorizontalCenterAbove, HorizontalCenterBelow,
    VerticalCenterBefore, VerticalCenterAfter,
    VerticalCenterToPageCenter, HorizontalCenterToPageCenter,
    LeftToPageCenter, RightToPageCenter, TopToPageCenter, BottomToPageCenter
}

export class ExtensionLine {
    constructor(public type: ExtensionLineType, public segment: Segment<Point>, public text: string) {
    }
}

export class ExtensionLinesVisualizer {
    lines: ExtensionLine[] = [];
    private lineIndexByType: {[key: number]: number} = {};

    constructor(private dispatcher: EventDispatcher<IVisualizersListener>) {}

    addSegment(type: ExtensionLineType, segment: Segment<Point>, text: string) {
        const curIndex = this.lineIndexByType[type];
        if(curIndex === undefined) {
            const line = new ExtensionLine(type, segment, text);
            const index = this.lines.push(line);
            this.lineIndexByType[line.type] = index - 1;
            this.raiseShow();
        }
        else if(segment.length < this.lines[curIndex].segment.length) {
            const line = new ExtensionLine(type, segment, text);
            this.lines.splice(curIndex, 1, line);
            this.raiseShow();
        }
    }
    update() {
        this.raiseShow();
    }
    reset() {
        if(this.lines.length) {
            this.lines = [];
            this.lineIndexByType = {};
            this.raiseHide();
        }
    }
    protected raiseShow() {
        this.dispatcher.raise1(l => l.notifyExtensionLinesShow(this.lines));
    }
    protected raiseHide() {
        this.dispatcher.raise1(l => l.notifyExtensionLinesHide());
    }
}
