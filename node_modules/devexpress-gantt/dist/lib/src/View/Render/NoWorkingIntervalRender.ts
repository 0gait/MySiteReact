import { GridElementInfo } from "../Helpers/GridElementInfo";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class NoWorkingIntervalRender {
    private _renderHelper: RenderHelper;
    private _noWorkingIntervalsToElementsMap: { [elementInfoId: number]: HTMLElement } = {};
    private _renderedNoWorkingIntervals: Array<GridElementInfo> = [];

    constructor(renderHelepr: RenderHelper) {
        this._renderHelper = renderHelepr;
    }

    public get noWorkingIntervalsToElementsMap(): { [elementInfoId: number]: HTMLElement } {
        return this._noWorkingIntervalsToElementsMap;
    }

    protected get taskAreaContainerScrollLeft(): number {
        return this._renderHelper.ganttTaskAreaContainerScrollLeft;
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    protected get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    protected get renderedNoWorkingIntervals(): GridElementInfo[] {
        return this._renderedNoWorkingIntervals;
    }

    protected set renderedNoWorkingIntervals(renderedNoWorkingIntervals: GridElementInfo[]) {
        this._renderedNoWorkingIntervals = renderedNoWorkingIntervals;
    }
    reset(): void {
        this._noWorkingIntervalsToElementsMap = {};
        this._renderedNoWorkingIntervals = [];
    }
    createNoWorkingIntervalElement(info: GridElementInfo): HTMLElement {
        return RenderElementUtils.create(info, null, this.taskArea, this.noWorkingIntervalsToElementsMap);
    }
    removeNoWorkingIntervalElement(info: GridElementInfo): void {
        RenderElementUtils.remove(info, null, this.taskArea, this.noWorkingIntervalsToElementsMap);
    }
    recreateNoWorkingIntervalElements(): void {
        const newRenderedNoWorkingIntervals = this.gridLayoutCalculator.getRenderedNoWorkingIntervals(this.taskAreaContainerScrollLeft);
        RenderElementUtils.recreate(
            this.renderedNoWorkingIntervals, newRenderedNoWorkingIntervals,
            info => { this.removeNoWorkingIntervalElement(info); },
            info => { this.createNoWorkingIntervalElement(info); }
        );
        this.renderedNoWorkingIntervals = newRenderedNoWorkingIntervals;
    }
}
