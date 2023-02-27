import { Size } from "@devexpress/utils/lib/geometry/size";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { ITaskAreaContainer } from "../../Interfaces/ITaskAreaContainer";
import { EtalonSizeValues } from "../Helpers/EtalonSizeValues";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class TaskAreaRender {
    private _renderHelper: RenderHelper;
    private _vertTaskAreaBorders: Array<HTMLElement> = [];
    private _horTaskAreaBorders: Array<HTMLElement> = [];
    private _taskAreaContainer: ITaskAreaContainer;
    private _isExternalTaskAreaContainer: boolean = false;

    constructor(renderHelepr: RenderHelper) {
        this._renderHelper = renderHelepr;
    }

    private get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    private get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    private get mainElement(): HTMLElement {
        return this._renderHelper.mainElement;
    }

    private get etalonSizeValues(): EtalonSizeValues {
        return this._renderHelper.etalonSizeValues;
    }

    private get scaleCount(): number {
        return this._renderHelper.scaleCount;
    }

    private get tickSize(): Size {
        return this._renderHelper.tickSize;
    }

    private get taskAreaContainerScrollTop(): number {
        return this._renderHelper.ganttViewTaskAreaContainerScrollTop;
    }

    private get taskAreaContainerScrollLeft(): number {
        return this._renderHelper.ganttTaskAreaContainerScrollLeft;
    }

    private get areHorizontalBordersEnabled(): boolean {
        return this._renderHelper.areHorizontalBordersEnabled;
    }

    private get renderedRowIndices(): number[] {
        return this._renderHelper.renderedRowIndices;
    }
    private set renderedRowIndices(renderedRowIndices: number[]) {
        this._renderHelper.renderedRowIndices = renderedRowIndices;
    }

    private get renderedColIndices(): number[] {
        return this._renderHelper.renderedColIndices;
    }
    private set renderedColIndices(renderedColIndices: number[]) {
        this._renderHelper.renderedColIndices = renderedColIndices;
    }

    private get vertTaskAreaBorders(): HTMLElement[] {
        return this._vertTaskAreaBorders;
    }

    private get horTaskAreaBorders(): HTMLElement[] {
        return this._horTaskAreaBorders;
    }

    private get hlRowElements(): HTMLElement[] {
        return this._renderHelper.hlRowElements;
    }

    public get taskAreaContainer() :ITaskAreaContainer {
        return this._taskAreaContainer;
    }

    getExternalTaskAreaContainer(parent: HTMLElement): ITaskAreaContainer {
        return this._renderHelper.getExternalTaskAreaContainer(parent);
    }
    prepareExternalTaskAreaContainer(element: HTMLElement, info: Record<string, any>): void {
        return this._renderHelper.prepareExternalTaskAreaContainer(element, info);
    }

    isAllowTaskAreaBorders(isVerticalScroll: boolean): boolean {
        return this._renderHelper.isAllowTaskAreaBorders(isVerticalScroll);
    }

    getTaskAreaContainerElement(): HTMLElement {
        return this._taskAreaContainer.getElement();
    }

    initTaskAreaContainer(element: HTMLElement): void {
        this._renderHelper.createTaskArea(element);
        this._taskAreaContainer = this.getExternalTaskAreaContainer(element);
        this._isExternalTaskAreaContainer = !!this._taskAreaContainer;
        if(this.taskAreaContainer == null)
            this._taskAreaContainer = this._renderHelper.getTaskAreaContainer(element);
    }

    createTaskElement(index: number): void {
        this._renderHelper.createTaskElement(index);
    }

    removeTaskElement(index: number): void {
        this._renderHelper.removeTaskElement(index);
    }

    reset(): void {
        this._horTaskAreaBorders = [];
        this._vertTaskAreaBorders = [];
    }


    prepareTaskAreaContainer(): void {
        const className = "dx-gantt-tac-hb";
        const element = this.getTaskAreaContainerElement();
        this.areHorizontalBordersEnabled ?
            DomUtils.addClassName(element, className) : DomUtils.removeClassName(element, className);
        const marginTop = parseInt(getComputedStyle(element).getPropertyValue("margin-top")) || 0;
        const height = `calc(100% - ${this.etalonSizeValues.scaleItemHeight * this.scaleCount + marginTop}px)`;
        if(this._isExternalTaskAreaContainer)
            this.prepareExternalTaskAreaContainer(element, { height: height });
        else
            element.style.height = height;
    }
    createTaskAreaContainer(): void {
        const element = document.createElement("DIV");
        element.className = "dx-gantt-tac";
        this.mainElement.appendChild(element);
        this.initTaskAreaContainer(element);
        this.prepareTaskAreaContainer();
    }
    createTaskAreaBorder(index: number, isVertical: boolean): void {
        const info = this.gridLayoutCalculator.getTaskAreaBorderInfo(index, isVertical);
        RenderElementUtils.create(info, index, this.taskArea, this.getTaskAreaBordersDictionary(isVertical));
    }
    createTaskArea(): HTMLElement {
        const taskArea = document.createElement("DIV");
        taskArea.id = "dx-gantt-ta";
        return taskArea;
    }
    removeTaskAreaBorder(index: number, isVertical: boolean): void {
        RenderElementUtils.remove(null, index, this.taskArea, this.getTaskAreaBordersDictionary(isVertical));
    }
    createTaskAreaBorderAndTaskElement(index: number, isVerticalScroll: boolean): void {
        if(this.isAllowTaskAreaBorders(isVerticalScroll))
            this.createTaskAreaBorder(index, !isVerticalScroll);
        if(isVerticalScroll)
            this.createTaskElement(index);
    }
    removeTaskAreaBorderAndTaskElement(index: number, isVerticalScroll: boolean): void {
        if(this.isAllowTaskAreaBorders(isVerticalScroll))
            this.removeTaskAreaBorder(index, !isVerticalScroll);
        if(isVerticalScroll)
            this.removeTaskElement(index);
    }
    recreateTaskAreaBordersAndTaskElements(isVertical: boolean): void {
        const scrollPos = isVertical ? this.taskAreaContainerScrollTop : this.taskAreaContainerScrollLeft;
        const newRenderedIndices = this.gridLayoutCalculator.getRenderedRowColumnIndices(scrollPos, isVertical);
        const renderedIndices = isVertical ? this.renderedRowIndices : this.renderedColIndices;
        RenderElementUtils.recreate(
            renderedIndices, newRenderedIndices,
            index => { this.removeTaskAreaBorderAndTaskElement(index, isVertical); },
            index => { this.createTaskAreaBorderAndTaskElement(index, isVertical); }
        );
        if(isVertical)
            this.renderedRowIndices = newRenderedIndices;
        else
            this.renderedColIndices = newRenderedIndices;
        this.gridLayoutCalculator.createTileToConnectorLinesMap();
    }
    getTaskAreaBordersDictionary(isVertical: boolean): HTMLElement[] {
        return isVertical ? this.vertTaskAreaBorders : this.horTaskAreaBorders;
    }
    setSizeForTaskArea(width: number, height: number): void {
        this.taskArea.style.width = width + "px";
        this.taskArea.style.height = height + "px";
    }
    createHighlightRowElement(index: number): void {
        const hlRowInfo = this.gridLayoutCalculator.getHighlightRowInfo(index);
        RenderElementUtils.create(hlRowInfo, index, this.taskArea, this.hlRowElements);
    }
}
