import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { Dependency } from "../../Model/Entities/Dependency";
import { Task } from "../../Model/Entities/Task";
import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { TaskTitlePosition } from "../Helpers/Enums";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { CustomTaskRender } from "./CustomTaskRender";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class TaskRender {
    static minTitleOutRightPadding = 5;

    private _renderHelper: RenderHelper;
    private _selectionElements: Array<HTMLElement> = [];
    private _taskElements: Array<HTMLElement> = [];
    private _fakeTaskWrapper: HTMLElement;

    customTaskRender: CustomTaskRender;


    constructor(renderHelper: RenderHelper) {
        this._renderHelper = renderHelper;
        this.customTaskRender = new CustomTaskRender(renderHelper, this);
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    public get taskElements(): HTMLElement[] {
        return this._taskElements;
    }

    public get selectionElements(): HTMLElement[] {
        return this._selectionElements;
    }

    protected get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    protected get isExternalTaskAreaContainer(): boolean {
        return this._renderHelper.isExternalTaskAreaContainer;
    }

    protected get resourcesElements(): HTMLElement[] {
        return this._renderHelper.resourcesElements;
    }

    protected get hlRowElements():HTMLElement[] {
        return this._renderHelper.hlRowElements;
    }

    protected get renderedRowIndices(): number[] {
        return this._renderHelper.renderedRowIndices;
    }

    protected get taskTitlePosition(): TaskTitlePosition {
        return this._renderHelper.taskTitlePosition;
    }

    protected get showResources(): boolean {
        return this._renderHelper.showResources;
    }

    protected get areHorizontalBordersEnabled(): boolean {
        return this._renderHelper.areHorizontalBordersEnabled;
    }

    protected get taskTextHeightKey(): string {
        return this._renderHelper.taskTextHeightKey;
    }

    get viewModelItems(): ViewVisualModelItem[] {
        return this._renderHelper.viewModelItems;
    }

    isHighlightRowElementAllowed(index: number): boolean {
        return this._renderHelper.isHighlightRowElementAllowed(index);
    }

    getTaskVisibility(index: number): boolean {
        return this._renderHelper.getTaskVisibility(index);
    }
    getTaskText(index: number): string {
        return this._renderHelper.getTaskText(index);
    }

    protected get invalidTaskDependencies(): Dependency[] {
        return this._renderHelper.invalidTaskDependencies;
    }

    public get fakeTaskWrapper(): HTMLElement {
        this._fakeTaskWrapper ??= this.createFakeTaskWrapper();
        return this._fakeTaskWrapper;
    }

    getViewItem(index: number): ViewVisualModelItem {
        return this._renderHelper.getViewItem(index);
    }

    getTask(index: number): Task {
        return this._renderHelper.getTask(index);
    }

    createHighlightRowElement(index: number): void {
        this._renderHelper.createHighlightRowElement(index);
    }


    getTaskDependencies(taskInternalId: any): Dependency[] {
        return this._renderHelper.getTaskDependencies(taskInternalId);
    }


    addInvalidTaskDependencies(taskDependencies: Array<Dependency>): void {
        this._renderHelper.invalidTaskDependencies = this._renderHelper.invalidTaskDependencies.concat(taskDependencies);
    }

    removeInvalidTaskDependencies(taskId: any): void {
        this._renderHelper.invalidTaskDependencies = this._renderHelper.invalidTaskDependencies.filter(d => d.predecessorId != taskId || d.successorId != taskId);
    }

    createResources(index: number): void {
        if(this.showResources)
            this._renderHelper.createResources(index);
    }

    attachEventsOnTask(taskIndex: number): void {
        this._renderHelper.attachEventsOnTask(taskIndex);
    }

    detachEventsOnTask(taskIndex: number): void {
        this._renderHelper.detachEventsOnTask(taskIndex);
    }

    recreateConnectorLineElement(dependencyId: string, forceRender: boolean = false): void {
        this._renderHelper.recreateConnectorLineElement(dependencyId, forceRender);
    }
    renderTaskElement(index: number): void {
        this._renderHelper.createTaskElement(index);
    }

    reset(): void {
        this._taskElements.forEach((el, i) => this.removeTaskElement(i));
        this._selectionElements = [];
        this._taskElements = [];
    }

    createTaskWrapperElement(index: number): void {
        const taskWrapperInfo = this.gridLayoutCalculator.getTaskWrapperElementInfo(index);
        RenderElementUtils.create(taskWrapperInfo, index, this.taskArea, this.taskElements);
        this.taskElements[index].style.display = this.getTaskVisibility(index) ? "" : "none";
    }
    createTaskElement(index: number, taskTemplateFunction: (container: HTMLElement, model: any) => boolean): void {
        const viewItem = this.getViewItem(index);

        if(taskTemplateFunction)
            this.customTaskRender.createCustomTaskElement(index, taskTemplateFunction);

        if(!viewItem.task.isValid() || !viewItem.visible) {
            const taskDependencies = this.getTaskDependencies(viewItem.task.internalId);
            this.addInvalidTaskDependencies(taskDependencies);
            return;
        }

        if(!viewItem.isCustom)
            this.createDefaultTaskElement(index);

    }
    createTaskVisualElement(index: number): HTMLElement {
        const taskElementInfo = this.gridLayoutCalculator.getTaskElementInfo(index, this.taskTitlePosition !== TaskTitlePosition.Inside);
        const taskElement = RenderElementUtils.create(taskElementInfo, index, this.taskElements[index]);
        this.attachEventsOnTask(index);
        return taskElement;
    }
    createDefaultTaskElement(index: number):void {
        const viewItem = this.getViewItem(index);
        if(this.isHighlightRowElementAllowed(index))
            this.createHighlightRowElement(index);
        if(viewItem.selected)
            this.createTaskSelectionElement(index);
        this.createTaskWrapperElement(index);
        if(this.taskTitlePosition === TaskTitlePosition.Outside)
            this.createTaskTextElement(index, this.taskElements[index]);
        const taskVisualElement = this.createTaskVisualElement(index);
        if(!viewItem.task.isMilestone()) {
            if(this.taskTitlePosition === TaskTitlePosition.Inside)
                this.createTaskTextElement(index, taskVisualElement);
            this.createTaskProgressElement(index, taskVisualElement);
        }

        this.createResources(index);
    }

    removeTaskElement(index: number): void {
        const task = this.getTask(index);
        if(task)
            this.removeInvalidTaskDependencies(task.id);
        this.detachEventsOnTask(index);

        if(this._renderHelper.hasTaskTemplate()) {
            const taskWrapper = this.taskElements[index];
            const taskTemplateContainer = taskWrapper?.firstElementChild;
            if(taskTemplateContainer) {
                this._renderHelper.destroyTemplate(taskTemplateContainer as HTMLElement);
                taskWrapper.removeChild(taskTemplateContainer);
            }
        }

        RenderElementUtils.remove(null, index, this.taskArea, this.taskElements);
        RenderElementUtils.remove(null, index, this.taskArea, this.resourcesElements);
        RenderElementUtils.remove(null, index, this.taskArea, this.selectionElements);
        if(this.isHighlightRowElementAllowed(index))
            RenderElementUtils.remove(null, index, this.taskArea, this.hlRowElements);
        this.gridLayoutCalculator.resetTaskInfo(index);
    }
    recreateTaskElement(index: number): void {
        const isVisible = this.renderedRowIndices.filter(r => r === index).length > 0;
        const task = this.getTask(index);
        if(!task) return;
        if(isVisible) {
            this.removeTaskElement(index);
            this.renderTaskElement(index);
        }
        const dependencies = this.getTaskDependencies(task.internalId);
        if(dependencies.length)
            dependencies.forEach(d => this.recreateConnectorLineElement(d.internalId, true));
    }

    createFakeTaskWrapper(): HTMLElement {
        const index = this.viewModelItems.filter(v => v.task && !v.task.isMilestone)[0]?.visibleIndex ?? 0;
        const calc = this.gridLayoutCalculator;
        const fakeWrapper = RenderElementUtils.create(calc.getTaskWrapperElementInfo(index), null, this.taskArea);
        const taskVisualElement = RenderElementUtils.create(calc.getTaskElementInfo(index), null, fakeWrapper);
        this.createTaskTextElement(index, taskVisualElement);
        this.createTaskProgressElement(index, taskVisualElement);
        fakeWrapper.style.display = "none";
        return fakeWrapper;
    }

    createTaskProgressElement(index: number, parent: HTMLElement): void {
        const taskProgressInfo = this.gridLayoutCalculator.getTaskProgressElementInfo(index);
        RenderElementUtils.create(taskProgressInfo, index, parent);
    }

    protected getTextWidth(text: string): number {
        return this._renderHelper.getTextWidth(text);
    }

    private _minTextWidth: number;
    public get minTextWidth() : number {
        this._minTextWidth ??= 5 * this.getTextWidth("a");
        return this._minTextWidth;
    }


    createTaskTextElement(index: number, parent: HTMLElement): void {
        const taskTextInfo = this.gridLayoutCalculator.getTaskTextElementInfo(index, this.taskTitlePosition === TaskTitlePosition.Inside);
        if(taskTextInfo.additionalInfo["hidden"]) return;

        const taskTextElement = RenderElementUtils.create(taskTextInfo, index, parent);
        const text = this.getTaskText(index);
        if(this.taskTitlePosition === TaskTitlePosition.Outside && taskTextInfo.size.width > 0) {
            const style = getComputedStyle(taskTextElement);
            const avaliableTextWidth = taskTextInfo.size.width - DomUtils.pxToInt(style.paddingLeft);
            if(avaliableTextWidth >= this.minTextWidth) {
                let rightPadding = DomUtils.pxToInt(style.paddingRight);
                const textWidth = text ? this.getTextWidth(text) : 0;
                if(rightPadding && textWidth > avaliableTextWidth - rightPadding) {
                    rightPadding = Math.min(TaskRender.minTitleOutRightPadding, avaliableTextWidth - this.minTextWidth);
                    taskTextElement.style.paddingRight = rightPadding + "px";
                }
                if(textWidth > avaliableTextWidth - rightPadding) {
                    taskTextElement.style.overflowX = "hidden";
                    taskTextElement.style.textOverflow = "ellipsis";
                }
            }
            else
                taskTextElement.style.display = "none";
        }

        if(!text) {
            this[this.taskTextHeightKey] ??= this.getTaskTextHeight(taskTextElement);
            taskTextElement.style.height = this[this.taskTextHeightKey];
        }
        taskTextElement.innerText = text;
    }
    createTaskSelectionElement(index: number): void {
        const selectionInfo = this.gridLayoutCalculator.getSelectionElementInfo(index);
        if(this.isExternalTaskAreaContainer && !this.areHorizontalBordersEnabled)
            selectionInfo.size.height++;
        RenderElementUtils.create(selectionInfo, index, this.taskArea, this.selectionElements);
    }

    getTaskTextHeight(textElement: HTMLElement): string {
        textElement.innerText = "WWW";
        const height = getComputedStyle(textElement).height;
        textElement.innerText = "";
        return height;
    }
    getSmallTaskWidth(etalonPaddingLeft: string): number {
        let result = 0;
        if(etalonPaddingLeft != null && etalonPaddingLeft !== "") {
            const indexOfRem = etalonPaddingLeft.indexOf("rem");
            if(indexOfRem > -1)
                try {
                    const remSize = parseFloat(etalonPaddingLeft.substr(0, indexOfRem));
                    result = remSize * parseFloat(getComputedStyle(document.documentElement).fontSize);
                }
                catch(e) { }

            else
                result = DomUtils.pxToInt(etalonPaddingLeft);
        }
        return result * 2;
    }
}
