import { GridElementInfo } from "../Helpers/GridElementInfo";
import { RenderHelper } from "./RenderHelper";
import { RenderElementUtils } from "./RenderElementUtils";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { TaskEditController } from "../Edit/TaskEditController";
import { Dependency } from "../../Model/Entities/Dependency";


export class ConnectorLinesRender {
    private _renderHelper: RenderHelper;
    private _connectorLinesToElementsMap: { [elementInfoId: number]: HTMLElement } = {};
    private _renderedConnectorLines: Array<GridElementInfo> = [];

    constructor(renderHelepr: RenderHelper) {
        this._renderHelper = renderHelepr;
    }

    protected get taskEditController(): TaskEditController {
        return this._renderHelper.taskEditController;
    }

    protected get taskAreaContainerScrollTop(): number {
        return this._renderHelper.ganttViewTaskAreaContainerScrollTop;
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    protected get connectorLinesToElementsMap(): { [elementInfoId: number]: HTMLElement } {
        return this._connectorLinesToElementsMap;
    }

    protected get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    protected get invalidTaskDependencies(): Dependency[] {
        return this._renderHelper.invalidTaskDependencies;
    }

    protected get showDependencies() : boolean {
        return this._renderHelper.showDependencies;
    }

    public get renderedConnectorLines(): GridElementInfo[] {
        return this._renderedConnectorLines;
    }

    reset(): void {
        this._connectorLinesToElementsMap = {};
        this._renderedConnectorLines = [];
    }

    createConnectorLineElement(info: GridElementInfo): HTMLElement {
        if(!this.showDependencies)
            return;
        const dependencyId = info.attr["dependency-id"];
        const isInvalid = this.invalidTaskDependencies.some(d => d.id == dependencyId);
        if(isInvalid) return;
        if(this.taskEditController.isDependencySelected(dependencyId))
            info.className = info.className + " active";
        const isArrow = info.className.indexOf(GridLayoutCalculator.arrowClassName) > -1;
        const element = RenderElementUtils.create(info, null, this.taskArea, this.connectorLinesToElementsMap);
        if(isArrow)
            this.gridLayoutCalculator.checkAndCorrectArrowElementDisplayByRange(element);
        return element;
    }
    removeConnectorLineElement(info: GridElementInfo): void {
        RenderElementUtils.remove(info, null, this.taskArea, this.connectorLinesToElementsMap);
    }
    recreateConnectorLineElement(dependencyId: string, forceRender: boolean = false): void {
        let infos: GridElementInfo[] = [];
        this._renderedConnectorLines = this.renderedConnectorLines.filter(function(info) {
            if(info.attr["dependency-id"] != dependencyId)
                return true;
            infos.push(info);
            return false;
        });
        const isRendered = infos.length > 0;
        infos.forEach(info => { this.removeConnectorLineElement(info); });
        infos = this.gridLayoutCalculator.updateTileToConnectorLinesMap(dependencyId);
        if(isRendered || forceRender)
            infos.forEach(info => { this.createConnectorLineElement(info); this.renderedConnectorLines.push(info); });
    }
    recreateConnectorLineElements(): void {
        const newRenderedConnectorLines = this.gridLayoutCalculator.getRenderedConnectorLines(this.taskAreaContainerScrollTop);
        RenderElementUtils.recreate(
            this.renderedConnectorLines, newRenderedConnectorLines,
            info => { this.removeConnectorLineElement(info); },
            info => { this.createConnectorLineElement(info); }
        );
        this._renderedConnectorLines = newRenderedConnectorLines;
    }

    updateRenderedConnectorLinesId(oldId: string, newKey : string): void {
        this._renderedConnectorLines.forEach(line => {
            if(line.attr["dependency-id"] === oldId)
                line.attr["dependency-id"] = newKey;
        });
        for(const key in this.connectorLinesToElementsMap) {
            if(!Object.prototype.hasOwnProperty.call(this.connectorLinesToElementsMap, key))
                continue;
            const element = this.connectorLinesToElementsMap[key];
            if(element.getAttribute("dependency-id") === oldId)
                element.setAttribute("dependency-id", newKey);
        }
        this.gridLayoutCalculator.updateTileToConnectorLinesMap(oldId);
        this.gridLayoutCalculator.updateTileToConnectorLinesMap(newKey);
    }
}
