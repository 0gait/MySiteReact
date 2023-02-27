import { Size } from "@devexpress/utils/lib/geometry/size";
import { Dependency } from "../../Model/Entities/Dependency";
import { Resource } from "../../Model/Entities/Resource";
import { Task } from "../../Model/Entities/Task";
import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { TaskTitlePosition } from "../Helpers/Enums";
import { GridElementInfo } from "../Helpers/GridElementInfo";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";
import { TaskRender } from "./TaskRender";

export class CustomTaskRender {
    private _renderHelper: RenderHelper;
    private _taskRender: TaskRender;

    private _pendingTemplateFuncsToRender: Record<number, Array<(container: HTMLElement, model: any, ...args) => void>> = [];

    constructor(renderHelepr: RenderHelper, taskRender: TaskRender) {
        this._renderHelper = renderHelepr;
        this._taskRender = taskRender;
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    protected get tickSize(): Size {
        return this._renderHelper.tickSize;
    }

    protected get taskTitlePosition(): TaskTitlePosition {
        return this._renderHelper.taskTitlePosition;
    }

    protected get taskElements(): HTMLElement[] {
        return this._taskRender.taskElements;
    }

    protected get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    getViewItem(index: number): ViewVisualModelItem {
        return this._renderHelper.getViewItem(index);
    }

    getTask(index: number): Task {
        return this._renderHelper.getTask(index);
    }

    destroyTemplate(container: HTMLElement): void {
        this._renderHelper.destroyTemplate(container);
    }

    getTaskDependencies(taskInternalId: any): Dependency[] {
        return this._renderHelper.getTaskDependencies(taskInternalId);
    }

    getTaskResources(key: any): Resource[] {
        return this._renderHelper.getTaskResources(key);
    }

    attachEventsOnTask(taskIndex: number): void {
        this._renderHelper.attachEventsOnTask(taskIndex);
    }

    recreateConnectorLineElement(dependencyId: string, forceRender: boolean = false): void {
        this._renderHelper.recreateConnectorLineElement(dependencyId, forceRender);
    }

    createTaskSelectionElement(taskIndex: number): void {
        this._taskRender.createTaskSelectionElement(taskIndex);
    }


    createCustomTaskElement(index: number, taskTemplateFunction: (container: HTMLElement, model: any, ...args) => void): void {
        this._saveTemplateFuncToStack(index, taskTemplateFunction);
        if(this._hasRepeatedTemplateRenderCall(index))
            return;

        const viewItem = this.getViewItem(index);
        viewItem.isCustom = false;
        const taskTemplateContainer = document.createElement("DIV");
        const taskInformation = this.createCustomTaskInformation(index);
        viewItem.isCustom = true;
        taskTemplateFunction(taskTemplateContainer, taskInformation, this.onTaskTemplateContainerRendered.bind(this), index);
    }
    onTaskTemplateContainerRendered(taskTemplateContainer: HTMLElement, taskIndex: number): void {
        if(this._hasRepeatedTemplateRenderCall(taskIndex)) {
            if(taskTemplateContainer)
                this._renderHelper.destroyTemplate(taskTemplateContainer as HTMLElement);
            const templateFunc = this._getLastPendingTemplateFunc(taskIndex);
            setTimeout(() => this.createCustomTaskElement(taskIndex, templateFunc));
        }
        else
            this.drawCustomTask(taskTemplateContainer, taskIndex);
        this._clearTemplateFuncsStack(taskIndex);
    }
    _saveTemplateFuncToStack(index: number, taskTemplateFunction: (container: HTMLElement, model: any, ...args) => void): void {
        this._pendingTemplateFuncsToRender[index] ??= [];
        this._pendingTemplateFuncsToRender[index].push(taskTemplateFunction);
    }
    _clearTemplateFuncsStack(index: number): void { this._pendingTemplateFuncsToRender[index] = []; }
    _hasRepeatedTemplateRenderCall(index: number): boolean { return this._pendingTemplateFuncsToRender[index].length > 1; }
    _getLastPendingTemplateFunc(index: number): (container: HTMLElement, model: any, ...args) => void {
        const pendingStack = this._pendingTemplateFuncsToRender[index];
        return pendingStack[pendingStack.length - 1];
    }

    createCustomTaskWrapperElement(index: number, taskWrapperInfo: GridElementInfo): void {
        RenderElementUtils.create(taskWrapperInfo, index, this.taskArea, this.taskElements);
    }
    createCustomTaskVisualElement(index: number, taskElementInfo: GridElementInfo): HTMLElement {
        const taskElement = RenderElementUtils.create(taskElementInfo, index, this.taskElements[index]);
        return taskElement;
    }
    drawCustomTask(taskTemplateContainer: HTMLElement, taskIndex: number):void {
        if(!this.taskElements[taskIndex])
            return;
        const viewItem = this.getViewItem(taskIndex);
        viewItem.visible = !!taskTemplateContainer.innerHTML;
        this.taskElements[taskIndex].innerHTML = taskTemplateContainer.innerHTML;
        viewItem.size.height = this.taskElements[taskIndex].offsetHeight;
        viewItem.size.width = this.taskElements[taskIndex].offsetWidth;
        this.destroyTemplate(this.taskElements[taskIndex]);
        this._taskRender.removeTaskElement(taskIndex);
        if(viewItem.visible) {
            const taskWrapperInfo = this.gridLayoutCalculator.getTaskWrapperElementInfo(taskIndex);
            this.createCustomTaskWrapperElement(taskIndex, taskWrapperInfo);
            this.taskElements[taskIndex].appendChild(taskTemplateContainer);
            this.attachEventsOnTask(taskIndex);
        }
        else {
            const taskDependencies = this.getTaskDependencies(viewItem.task.internalId);
            if(taskDependencies.length) {
                this._taskRender.addInvalidTaskDependencies(taskDependencies);
                taskDependencies.forEach(d => this.recreateConnectorLineElement(d.internalId, true));
            }
        }
        if(this._taskRender.isHighlightRowElementAllowed(taskIndex))
            this._taskRender.createHighlightRowElement(taskIndex);
        if(viewItem.selected)
            this.createTaskSelectionElement(taskIndex);
    }
    createCustomTaskInformation(index: number):any {
        const task = this.getTask(index);
        const viewItem = this.getViewItem(index);
        const taskWrapperInfo = this.gridLayoutCalculator.getTaskWrapperElementInfo(index);
        const taskElementInfo = this.gridLayoutCalculator.getTaskElementInfo(index, this.taskTitlePosition !== TaskTitlePosition.Inside);
        this.createCustomTaskWrapperElement(index, taskWrapperInfo);
        const taskVisualElement = this.createCustomTaskVisualElement(index, taskElementInfo);
        this._taskRender.createTaskTextElement(index, taskVisualElement);
        const taskResources = this.getTaskResources(task.id);
        const taskInformation = {
            cellSize: this.tickSize,
            isMilestone: task.isMilestone(),
            isParent: !!viewItem?.children.length,
            taskData: task,
            taskHTML: taskVisualElement,
            taskPosition: taskWrapperInfo.position,
            taskResources: taskResources,
            taskSize: taskElementInfo.size,
        };

        return taskInformation;
    }
}
