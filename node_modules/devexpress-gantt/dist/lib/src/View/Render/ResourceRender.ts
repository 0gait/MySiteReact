import { Resource } from "../../Model/Entities/Resource";
import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class ResourseRender {
    private _renderHelper: RenderHelper;
    private _resourcesElements: Array<HTMLElement> = [];

    constructor(renderHelepr: RenderHelper) {
        this._renderHelper = renderHelepr;
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    protected get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    public get resourcesElements(): HTMLElement[] {
        return this._resourcesElements;
    }

    getViewItem(index: number): ViewVisualModelItem {
        return this._renderHelper.getViewItem(index);
    }

    getTaskResourcesVisibility(index: number): boolean {
        return this._renderHelper.getTaskResourcesVisibility(index);
    }

    createResources(index: number): void {
        const viewItem = this.getViewItem(index);
        const resources = viewItem.resources.items;
        for(let i = 0; i < resources.length; i++)
            this.createResourceElement(index, resources[i]);
    }
    createResourcesWrapperElement(index: number): void {
        const resourcesWrapperElementInfo = this.gridLayoutCalculator.getTaskResourcesWrapperElementInfo(index);
        RenderElementUtils.create(resourcesWrapperElementInfo, index, this.taskArea, this.resourcesElements);
        this.resourcesElements[index].style.display = this.getTaskResourcesVisibility(index) ? "" : "none";
    }
    createResourceElement(index: number, resource: Resource): void {
        const resourceElementInfo = this.gridLayoutCalculator.getTaskResourceElementInfo();
        if(resource.color)
            resourceElementInfo.style.backgroundColor = resource.color;
        const resElement = RenderElementUtils.create(resourceElementInfo, index, this.resourcesElements[index]);
        resElement.innerText = resource.text;
        this.gridLayoutCalculator.checkAndCorrectElementDisplayByRange(resElement);
    }
}
