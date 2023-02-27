import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { ViewType } from "../Helpers/Enums";
import { EtalonSizeValues } from "../Helpers/EtalonSizeValues";
import { GridElementInfo } from "../Helpers/GridElementInfo";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class EtalonsHelper {
    private _renderHelper: RenderHelper;

    constructor(renderHelepr: RenderHelper) {
        this._renderHelper = renderHelepr;
    }

    get mainElement(): HTMLElement {
        return this._renderHelper.mainElement;
    }

    get etalonSizeValues(): EtalonSizeValues {
        return this._renderHelper.etalonSizeValues;
    }

    get scaleCount(): number {
        return this._renderHelper.scaleCount;
    }

    getScaleItemTextTemplate(viewType: ViewType): string {
        return this._renderHelper.getScaleItemTextTemplate(viewType);
    }

    getHeaderHeight(): number {
        return this._renderHelper.getHeaderHeight();
    }

    getSmallTaskWidth(etalonPaddingLeft: string): number {
        return this._renderHelper.getSmallTaskWidth(etalonPaddingLeft);
    }


    createEtalonElementsContainer(): HTMLElement {
        const result = document.createElement("DIV");
        result.style.visibility = "hidden";
        result.style.position = "absolute";
        result.style.left = "-1000px";
        this.mainElement.appendChild(result);
        return result;
    }
    createEtalonElements(parent: HTMLElement): Array<HTMLElement> {
        const etalonElements = [];
        const wrapper = RenderElementUtils.create(new GridElementInfo("dx-gantt-taskWrapper"), null, parent);
        const task = RenderElementUtils.create(new GridElementInfo("dx-gantt-task"), null, wrapper);
        const taskTitle = RenderElementUtils.create(new GridElementInfo("dx-gantt-taskTitle dx-gantt-titleIn"), null, task);
        taskTitle.innerText = "WWW";
        etalonElements.push(wrapper);

        const milestoneWrapper = RenderElementUtils.create(new GridElementInfo("dx-gantt-taskWrapper"), null, parent);
        RenderElementUtils.create(new GridElementInfo("dx-gantt-task dx-gantt-milestone"), null, milestoneWrapper);
        etalonElements.push(milestoneWrapper);

        const etalonElementClassNames = [ "dx-gantt-conn-h", "dx-gantt-arrow", "dx-gantt-si", "dx-gantt-taskTitle dx-gantt-titleOut" ];

        for(let i = 0; i < etalonElementClassNames.length; i++) {
            const etalonElementInfo = new GridElementInfo(etalonElementClassNames[i]);
            etalonElements.push(RenderElementUtils.create(etalonElementInfo, null, parent));
        }

        const parentWrapper = RenderElementUtils.create(new GridElementInfo("dx-gantt-taskWrapper"), null, parent);
        const parentTask = RenderElementUtils.create(new GridElementInfo("dx-gantt-task dx-gantt-parent"), null, parentWrapper);
        const parentTaskTitle = RenderElementUtils.create(new GridElementInfo("dx-gantt-taskTitle dx-gantt-titleIn"), null, parentTask);
        parentTaskTitle.innerText = "WWW";
        etalonElements.push(parentWrapper);

        return etalonElements;
    }
    calculateEtalonSizeValues(): void {
        const etalonElementsContainer = this.createEtalonElementsContainer();
        const etalonElements = this.createEtalonElements(etalonElementsContainer);
        this.calculateEtalonSizeValuesCore(etalonElements);
        this.mainElement.removeChild(etalonElementsContainer);
    }
    calculateEtalonSizeValuesCore(etalonElements: Array<HTMLElement>): void {
        this.etalonSizeValues.taskHeight = (<HTMLElement>etalonElements[0].firstChild).offsetHeight;
        this.etalonSizeValues.milestoneWidth = (<HTMLElement>etalonElements[1].firstChild).offsetWidth;
        this.etalonSizeValues.taskWrapperTopPadding = DomUtils.pxToInt(DomUtils.getCurrentStyle(etalonElements[0]).paddingTop);
        this.etalonSizeValues.connectorLineThickness = DomUtils.getVerticalBordersWidth(etalonElements[2]);
        this.etalonSizeValues.connectorArrowWidth = DomUtils.getHorizontalBordersWidth(etalonElements[3]);
        for(let i = 0; i <= ViewType.Years; i++) {
            etalonElements[4].innerText = this.getScaleItemTextTemplate(i);
            this.etalonSizeValues.scaleItemWidths[i] = etalonElements[4].offsetWidth;
        }
        this.etalonSizeValues.smallTaskWidth = this.getSmallTaskWidth(DomUtils.getCurrentStyle(etalonElements[0].firstChild.firstChild as HTMLDivElement).paddingLeft);
        this.etalonSizeValues.outsideTaskTextDefaultWidth = DomUtils.pxToFloat(DomUtils.getCurrentStyle(etalonElements[5]).width);
        this.etalonSizeValues.scaleItemHeight = this.getHeaderHeight() / this.scaleCount;

        this.etalonSizeValues.parentTaskHeight = (<HTMLElement>etalonElements[etalonElements.length - 1].firstChild).offsetHeight;
    }
}
