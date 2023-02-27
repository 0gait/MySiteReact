import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { ModelChangesDispatcher } from "../../Model/Dispatchers/ModelChangesDispatcher";
import { DateRange } from "../../Model/WorkingTime/DateRange";
import { ViewType } from "../Helpers/Enums";
import { EtalonSizeValues } from "../Helpers/EtalonSizeValues";
import { GridElementInfo } from "../Helpers/GridElementInfo";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { DateUtils } from "../Utils/DateUtils";
import { ScaleCellPreparedArguments } from "./Events/ScaleCellPreparedArguments";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class ScaleRender {
    private _renderHelper: RenderHelper;
    private _scaleBorders: Array<Array<HTMLElement>> = [];
    private _scaleElements: Array<Array<HTMLElement>> = [];
    private _renderedScaleItemIndices: Array<Array<number>> = [];
    private _timeScaleAreas = new Array<HTMLElement>();
    private _timeScaleContainer: HTMLElement;

    constructor(renderHelper: RenderHelper) {
        this._renderHelper = renderHelper;
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    get etalonSizeValues(): EtalonSizeValues {
        return this._renderHelper.etalonSizeValues;
    }

    get timeScaleContainer(): HTMLElement {
        return this._timeScaleContainer;
    }

    get scaleCount(): number {
        return this._renderHelper.scaleCount;
    }

    get range(): DateRange {
        return this._renderHelper.range;
    }

    get viewType(): ViewType {
        return this._renderHelper.viewType;
    }

    get timeScaleAreas(): HTMLElement[] {
        return this._timeScaleAreas;
    }

    get scaleElements(): HTMLElement[][] {
        return this._scaleElements;
    }

    get scaleBorders(): HTMLElement[][] {
        return this._scaleBorders;
    }

    get renderedColIndices(): number[] {
        return this._renderHelper.renderedColIndices;
    }

    get renderedScaleItemIndices(): number[][] {
        return this._renderedScaleItemIndices;
    }

    getScaleItemText(index: number, scaleType: ViewType): string {
        return this._renderHelper.getScaleItemText(index, scaleType);
    }

    getTaskAreaWidth(): number {
        return this._renderHelper.getTaskAreaWidth();
    }

    reset(): void {
        this._scaleBorders = [];
        this._scaleElements = [];
        this._renderedScaleItemIndices = [];
        this._timeScaleAreas = [];
        this._timeScaleContainer.innerHTML = "";
    }

    setTimeScaleContainerScrollLeft(value: number): void {
        this._timeScaleContainer.scrollLeft = value;
    }

    createTimeScaleContainer(header: HTMLElement): void {
        const timeScaleContainer = document.createElement("DIV");
        timeScaleContainer.className = "dx-gantt-tsac";
        timeScaleContainer.style.height = this.etalonSizeValues.scaleItemHeight * this.scaleCount + "px";

        this._timeScaleContainer = timeScaleContainer;
        header.appendChild(this.timeScaleContainer);
    }
    createTimeScaleArea(): HTMLElement {
        const timeScaleArea = document.createElement("DIV");
        timeScaleArea.className = "dx-gantt-tsa";
        timeScaleArea.style.width = this.getTaskAreaWidth() + "px";
        timeScaleArea.style.height = this.etalonSizeValues.scaleItemHeight + "px";
        this.timeScaleContainer.appendChild(timeScaleArea);
        this.timeScaleAreas.unshift(timeScaleArea);
        return timeScaleArea;
    }
    createTimeScaleAreas(): void {
        for(let i = 0; i < this.scaleCount; i++)
            this.createTimeScaleArea();
    }
    createScaleElementCore(index: number, info: GridElementInfo, scaleIndex: number, dictionary: Array<Array<HTMLElement>>): HTMLElement {
        if(!dictionary[scaleIndex])
            dictionary[scaleIndex] = [];
        return RenderElementUtils.create(info, index, this.timeScaleAreas[scaleIndex], dictionary[scaleIndex]);
    }
    createScaleElement(index: number, scaleIndex: number, scaleType: ViewType, info: GridElementInfo): HTMLElement {
        const charWidth = this._renderHelper.getTextWidth("a");
        const scaleElement = this.createScaleElementCore(index, info, scaleIndex, this.scaleElements);
        scaleElement.style.lineHeight = this.etalonSizeValues.scaleItemHeight + "px";
        if(info?.size.width > charWidth * 5) {
            const text = this.getScaleItemText(index, scaleType);
            scaleElement.innerText = text;
            if(scaleType === ViewType.Quarter)
                scaleElement.style.padding = "0";
            const style = getComputedStyle(scaleElement);
            const avaliableTextWidth = info.size.width - DomUtils.pxToInt(style.paddingLeft) - DomUtils.pxToInt(style.paddingRight);
            if(avaliableTextWidth < this._renderHelper.getTextWidth(text))
                scaleElement.title = text;
        }
        return scaleElement;
    }
    createScaleBorder(index: number, scaleIndex: number, scaleType: ViewType): HTMLElement {
        const info = this.gridLayoutCalculator.getScaleBorderInfo(index, scaleType);
        return this.createScaleElementCore(index, info, scaleIndex, this.scaleBorders);
    }
    createScaleElementAndBorder(index: number, scaleIndex: number, scaleType: ViewType): void {
        const scaleLemenentInfo = this.gridLayoutCalculator.getScaleElementInfo(index, scaleType);
        const scaleElement = this.createScaleElement(index, scaleIndex, scaleType, scaleLemenentInfo);
        const borderElement = this.createScaleBorder(index, scaleIndex, scaleType);
        this.onScaleCellPrepared(scaleType, scaleIndex, scaleElement, borderElement, scaleLemenentInfo.additionalInfo["range"]);
    }
    removeScaleElementAndBorder(index: number, scaleIndex: number): void {
        RenderElementUtils.remove(null, index, this.timeScaleAreas[scaleIndex], this.scaleElements[scaleIndex]);
        RenderElementUtils.remove(null, index, this.timeScaleAreas[scaleIndex], this.scaleBorders[scaleIndex]);
    }
    recreateScalesElements(): void {
        this.recreateScaleElements(this.viewType, 0);
        this.recreateScaleElements(DateUtils.ViewTypeToScaleMap[this.viewType], 1);
    }
    recreateScaleElements(scaleType: ViewType, scaleIndex: number): void {
        const newRenderedIndices = this.gridLayoutCalculator.getRenderedScaleItemIndices(scaleType, this.renderedColIndices);
        const renderedIndices = this.renderedScaleItemIndices[scaleType - this.viewType] || [];
        RenderElementUtils.recreate(
            renderedIndices, newRenderedIndices,
            index => { this.removeScaleElementAndBorder(index, scaleIndex); },
            index => { this.createScaleElementAndBorder(index, scaleIndex, scaleType); }
        );
        this.renderedScaleItemIndices[scaleType - this.viewType] = newRenderedIndices;
    }
    protected get dispatcher(): ModelChangesDispatcher {
        return this._renderHelper.dispatcher;
    }
    onScaleCellPrepared(scaleType: ViewType, scaleIndex: number, scaleElement : HTMLElement, separatorElement : HTMLElement, range: DateRange): void {
        const args = new ScaleCellPreparedArguments({ scaleType, scaleIndex, range, scaleElement, separatorElement });
        this.dispatcher.notifyScaleCellPrepared(args);
    }
}
