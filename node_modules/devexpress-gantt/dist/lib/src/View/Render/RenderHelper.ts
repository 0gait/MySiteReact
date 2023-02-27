import { ConnectorLinesRender } from "./ConnectorLinesRender";
import { Dependency } from "../../Model/Entities/Dependency";
import { EtalonsHelper } from "./EtalonsHelper";
import { EtalonSizeValues } from "../Helpers/EtalonSizeValues";
import { GanttView } from "../GanttView";
import { GridElementInfo } from "../Helpers/GridElementInfo";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { ITaskAreaContainer } from "../../Interfaces/ITaskAreaContainer";
import { NoWorkingIntervalRender } from "./NoWorkingIntervalRender";
import { ResourseRender } from "./ResourceRender";
import { ScaleRender } from "./ScaleRender";
import { StripLinesRender } from "./StripLinesRender";
import { TaskAreaManager } from "../Events/TaskAreaManager";
import { TaskAreaRender } from "./TaskAreaRender";
import { TaskRender } from "./TaskRender";
import { MainElementsRender } from "./MainElementsRender";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { DateRange } from "../../Model/WorkingTime/DateRange";
import { TaskTitlePosition, ViewType } from "../Helpers/Enums";
import { ViewVisualModel } from "../../Model/VisualModel/VisualModel";
import { TaskAreaContainer } from "../Helpers/TaskAreaContainer";
import { TaskEditController } from "../Edit/TaskEditController";
import { Resource } from "../../Model/Entities/Resource";
import { Task } from "../../Model/Entities/Task";
import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { StripLineSettings } from "../Settings/StripLineSettings";
import { ElementTextHelper } from "../Utils/ElementTextHelper";
import { ElementTextHelperCultureInfo } from "../Utils/ElementTextHelperCultureInfo";
import { Settings } from "../Settings/Settings";
import { ModelChangesDispatcher } from "../../Model/Dispatchers/ModelChangesDispatcher";

export class RenderHelper {
    mainElement: HTMLElement;
    header: HTMLElement;

    private _taskArea: HTMLElement;
    private _taskAreaManager: TaskAreaManager;

    hlRowElements: Array<HTMLElement> = [];

    renderedColIndices: Array<number> = [];
    renderedRowIndices: Array<number> = [];

    invalidTaskDependencies: Array<Dependency> = [];

    etalonSizeValues = new EtalonSizeValues();
    private _gridLayoutCalculator = new GridLayoutCalculator();

    private _connectorLinesRender: ConnectorLinesRender;
    private _etalonsHelper: EtalonsHelper;
    private _noWorkingIntervalRender: NoWorkingIntervalRender;
    private _resourceRender: ResourseRender;
    private _scaleRender: ScaleRender;
    private _stripLinesRender: StripLinesRender;
    private _taskAreaRender: TaskAreaRender;
    private _taskRender: TaskRender;
    private _mainElementsRender: MainElementsRender

    private _ganttView: GanttView;
    private _elementTextHelper: ElementTextHelper;

    constructor(ganttView: GanttView) {
        this._ganttView = ganttView;
        this._connectorLinesRender = new ConnectorLinesRender(this);
        this._etalonsHelper = new EtalonsHelper(this);
        this._noWorkingIntervalRender = new NoWorkingIntervalRender(this);
        this._resourceRender = new ResourseRender(this);
        this._scaleRender = new ScaleRender(this);
        this._stripLinesRender = new StripLinesRender(this);
        this._taskAreaRender = new TaskAreaRender(this);
        this._taskRender = new TaskRender(this);
        this._mainElementsRender = new MainElementsRender();
    }


    reset(): void {
        this.invalidTaskDependencies = [];
        this._taskAreaRender.reset();
        this._taskRender.reset();
        this._taskArea.innerHTML = "";
        this._scaleRender.reset();
        this.hlRowElements = [];
        this.renderedRowIndices = [];
        this.renderedColIndices = [];
        this._connectorLinesRender.reset();
        this._stripLinesRender.reset();
        this._noWorkingIntervalRender.reset();
    }

    createMainElement(parent: HTMLElement): void {
        this.mainElement = this._mainElementsRender.createMainElement(parent);
        parent.appendChild(this.mainElement);
    }

    createHeader(): void {
        this.header = this._mainElementsRender.createHeader();
        this.mainElement.appendChild(this.header);
    }

    init(tickSize: Size, range: DateRange, viewType: ViewType, viewModel: ViewVisualModel, firstDayOfWeek: number = 0): void {
        this._elementTextHelper.setFont(this.mainElement);
        this.setupHelpers(tickSize, range, viewType, viewModel, firstDayOfWeek);
        this.setSizeForTaskArea();
        this.createTimeScale();
        this._taskAreaManager = new TaskAreaManager(this._ganttView.taskAreaEventsListener, this.taskArea, this.tickSize);
    }

    initMarkup(element: HTMLElement): void {
        this._elementTextHelper = new ElementTextHelper(this.ganttViewSettings.cultureInfo);
        this.createMainElement(element);
        this.createHeader();
        this._etalonsHelper.calculateEtalonSizeValues();
        this._taskAreaRender.createTaskAreaContainer();

    }

    processScroll(isVertical: boolean): void {
        this._taskAreaRender.recreateTaskAreaBordersAndTaskElements(isVertical);
        if(isVertical)
            this._connectorLinesRender.recreateConnectorLineElements();
        else {
            this._noWorkingIntervalRender.recreateNoWorkingIntervalElements();
            this._stripLinesRender.recreateStripLines();
            this._scaleRender.recreateScalesElements();
        }
    }


    private get ganttViewSettings(): Settings {
        return this._ganttView.settings;
    }
    public get taskTextHeightKey(): string {
        return GanttView.taskTextHeightKey;
    }
    public get showResources(): boolean {
        return this.ganttViewSettings.showResources;
    }
    public get showDependencies(): boolean {
        return this.ganttViewSettings.showDependencies;
    }
    public get viewModelItems(): ViewVisualModelItem[] {
        return this._ganttView.viewModel.items;
    }
    public get stripLines(): StripLineSettings {
        return this.ganttViewSettings.stripLines;
    }
    public get range(): DateRange {
        return this._ganttView.range;
    }
    public get viewType(): ViewType {
        return this.ganttViewSettings.viewType;
    }
    public get taskTitlePosition(): TaskTitlePosition {
        return this.ganttViewSettings.taskTitlePosition;
    }
    public get tickSize(): Size {
        return this._ganttView.tickSize;
    }
    public get ganttViewTaskAreaContainerScrollTop(): number {
        return this._ganttView.taskAreaContainerScrollTop;
    }
    public get ganttTaskAreaContainerScrollLeft(): number {
        return this._ganttView.taskAreaContainerScrollLeft;
    }
    public get scaleCount(): number {
        return this._ganttView.scaleCount;
    }
    public get areHorizontalBordersEnabled(): boolean {
        return this.ganttViewSettings.areHorizontalBordersEnabled;
    }
    public get taskEditController(): TaskEditController {
        return this._ganttView.taskEditController;
    }
    public get dispatcher(): ModelChangesDispatcher {
        return this._ganttView.dispatcher;
    }


    public get taskArea(): HTMLElement {
        return this._taskArea;
    }
    protected get taskAreaManager(): TaskAreaManager {
        this._taskAreaManager ??= new TaskAreaManager(this._ganttView.taskAreaEventsListener, this.taskArea, this.tickSize);
        return this._taskAreaManager;
    }
    public get taskAreaContainerScrollTop(): number {
        return this._taskAreaRender.taskAreaContainer.scrollTop;
    }
    public get taskAreaContainerScrollLeft(): number {
        return this._taskAreaRender.taskAreaContainer.scrollLeft;
    }
    public get taskAreaContainer(): ITaskAreaContainer {
        return this._taskAreaRender.taskAreaContainer;
    }

    public get isExternalTaskAreaContainer(): boolean {
        return this._taskAreaRender.taskAreaContainer.isExternal;
    }


    public get fakeTaskWrapper(): HTMLElement {
        return this._taskRender.fakeTaskWrapper;
    }
    public get taskElements(): HTMLElement[] {
        return this._taskRender.taskElements;
    }
    public get selectionElements(): HTMLElement[] {
        return this._taskRender.selectionElements;
    }


    public get scaleElements(): HTMLElement[][] {
        return this._scaleRender.scaleElements;
    }
    public get scaleBorders(): HTMLElement[][] {
        return this._scaleRender.scaleBorders;
    }

    public get timeScaleContainer(): HTMLElement {
        return this._scaleRender.timeScaleContainer;
    }


    public get gridLayoutCalculator(): GridLayoutCalculator {
        return this._gridLayoutCalculator;
    }

    public get etalonScaleItemWidths(): number {
        return this.etalonSizeValues.scaleItemWidths[this.viewType];
    }

    public get elementTextHelperCultureInfo(): ElementTextHelperCultureInfo {
        return this._elementTextHelper.cultureInfo;
    }

    public get noWorkingIntervalsToElementsMap(): { [elementInfoId: number]: HTMLElement } {
        return this._noWorkingIntervalRender.noWorkingIntervalsToElementsMap;
    }

    public get stripLinesMap(): GridElementInfo[][] {
        return this._stripLinesRender.stripLinesMap;
    }

    public get renderedConnectorLines(): GridElementInfo[] {
        return this._connectorLinesRender.renderedConnectorLines;
    }

    public get allConnectorLines(): GridElementInfo[] {
        const lines = this.gridLayoutCalculator.tileToDependencyMap.reduce((acc, tile) => acc = acc.concat(tile), []);
        return lines;
    }

    public get resourcesElements(): HTMLElement[] {
        return this._resourceRender.resourcesElements;
    }


    setupHelpers(tickSize: Size, range: DateRange, viewType: ViewType, viewModel: ViewVisualModel, firstDayOfWeek: number = 0): void {
        const size = new Size(this._taskAreaRender.taskAreaContainer.getWidth(), this._taskAreaRender.taskAreaContainer.getHeight());
        const scrollBarHeight = this._taskAreaRender.taskAreaContainer.getHeight() - this._taskAreaRender.taskAreaContainer.getElement().clientHeight;
        this._gridLayoutCalculator.setSettings(size, tickSize, this.etalonSizeValues, range, viewModel, viewType, scrollBarHeight, firstDayOfWeek);
        this._elementTextHelper.setSettings(range.start.getTime(), viewType, viewModel.items);
    }

    resetAndUpdate(tickSize: Size, range: DateRange, viewType: ViewType, viewModel: ViewVisualModel, firstDayOfWeek: number = 0): void {
        const leftPosition = this.getTaskAreaContainerScrollLeft();
        this.reset();
        this.setupHelpers(tickSize, range, viewType, viewModel, firstDayOfWeek);
        this._scaleRender.createTimeScaleAreas();
        this.setSizeForTaskArea();
        this.setTaskAreaContainerScrollLeft(leftPosition);
    }

    createConnectorLines(): void {
        this._gridLayoutCalculator.createTileToConnectorLinesMap();
        this._connectorLinesRender.recreateConnectorLineElements();
    }


    getTargetDateByPos(leftPos: number): Date {
        return this._gridLayoutCalculator.getDateByPos(this._taskAreaRender.taskAreaContainer.scrollLeft + leftPos);
    }



    getExternalTaskAreaContainer(parent: HTMLElement): ITaskAreaContainer {
        return this._ganttView.getExternalTaskAreaContainer(parent);
    }
    prepareExternalTaskAreaContainer(element: HTMLElement, info: Record<string, any>): void {
        return this._ganttView.prepareExternalTaskAreaContainer(element, info);
    }

    isAllowTaskAreaBorders(isVerticalScroll: boolean): boolean {
        return this._ganttView.allowTaskAreaBorders(isVerticalScroll);
    }

    getHeaderHeight(): number {
        return this._ganttView.getHeaderHeight();
    }

    getViewItem(index: number): ViewVisualModelItem {
        return this._ganttView.getViewItem(index);
    }

    getTask(index: number): Task {
        return this._ganttView.getTask(index);
    }
    hasTaskTemplate(): boolean {
        return !!this._ganttView.settings.taskContentTemplate;
    }

    destroyTemplate(container: HTMLElement): void {
        this._ganttView.destroyTemplate(container);
    }

    getTaskDependencies(taskInternalId: any): Dependency[] {
        return this._ganttView.getTaskDependencies(taskInternalId);
    }

    getTaskResources(key: any): Resource[] {
        return this._ganttView.getTaskResources(key);
    }

    isHighlightRowElementAllowed(index: number): boolean {
        return this._ganttView.isHighlightRowElementAllowed(index);
    }

    updateRenderedConnectorLinesId(oldId: string, newKey : string): void {
        this._connectorLinesRender.updateRenderedConnectorLinesId(oldId, newKey);
    }

    recreateConnectorLineElement(dependencyId: string, forceRender: boolean = false): void {
        this._connectorLinesRender.recreateConnectorLineElement(dependencyId, forceRender);
    }

    recreateConnectorLineElemensts(): void {
        this._connectorLinesRender.recreateConnectorLineElements();
    }



    setMainElementWidth(value: number): void {
        this.mainElement.style.width = value + "px";
    }
    setMainElementHeight(value: number): void {
        this.mainElement.style.height = value + "px";
    }


    createResources(index: number): void {
        this._resourceRender.createResourcesWrapperElement(index);
        this._resourceRender.createResources(index);
    }


    createTimeScale(): void {
        this._scaleRender.createTimeScaleContainer(this.header);
        this._scaleRender.createTimeScaleAreas();
    }

    setTimeScaleContainerScrollLeft(value: number): void {
        this._scaleRender.setTimeScaleContainerScrollLeft(value);
    }


    recreateStripLines(): void {
        if(this._stripLinesRender.recreateStripLines)
            this._stripLinesRender.recreateStripLines();
    }


    createTaskArea(parent: HTMLElement): void {
        this._taskArea = this._taskAreaRender.createTaskArea();
        this._taskArea.setAttribute("task-edit-enabled", this.isTaskUpdateAllowed().toString());
        parent.appendChild(this._taskArea);
    }
    private isTaskUpdateAllowed(): boolean {
        const settings = this.ganttViewSettings.editing;
        return settings.enabled && settings.allowTaskUpdate;
    }

    setSizeForTaskArea(): void {
        const width = this.getTaskAreaWidth();
        const height = this.getTaskAreaHeight();
        this._taskAreaRender.setSizeForTaskArea(width, height);
        this._ganttView.onTaskAreaSizeChanged({ width, height });
    }
    getTaskAreaWidth(): number {
        return this.gridLayoutCalculator.getTotalWidth();
    }
    getTaskAreaHeight(): number {
        return this.gridLayoutCalculator.getVerticalGridLineHeight();
    }

    getTaskAreaContainerScrollLeft(): number {
        return this._taskAreaRender.taskAreaContainer.scrollLeft;
    }

    setTaskAreaContainerScrollLeft(leftPosition: number): void {
        this._taskAreaRender.taskAreaContainer.scrollLeft = leftPosition;
    }
    setTaskAreaContainerScrollLeftToDate(date: Date, addLeftPos: number): void {
        this._taskAreaRender.taskAreaContainer.scrollLeft = Math.round(this._gridLayoutCalculator.getPosByDate(date)) + addLeftPos;
    }

    getTaskAreaContainer(element: HTMLElement): ITaskAreaContainer {
        return new TaskAreaContainer(element, this._ganttView);
    }

    prepareTaskAreaContainer(): void {
        this._taskAreaRender.prepareTaskAreaContainer();
    }

    getTaskAreaContainerWidth(): number {
        return this._taskAreaRender.taskAreaContainer.getWidth();
    }

    createHighlightRowElement(index: number): void {
        this._taskAreaRender.createHighlightRowElement(index);
    }


    getSmallTaskWidth(etalonPaddingLeft: string): number {
        return this._taskRender.getSmallTaskWidth(etalonPaddingLeft);
    }

    createTaskElement(index: number): void {
        this._taskRender.createTaskElement(index, this._ganttView.settings.taskContentTemplate);
    }

    removeTaskElement(index: number): void {
        this._taskRender.removeTaskElement(index);
    }

    recreateTaskElement(index: number): void {
        this._taskRender.recreateTaskElement(index);
    }

    createDefaultTaskElement(index: number): void {
        this._taskRender.createDefaultTaskElement(index);
    }


    getScaleItemText(index: number, scaleType: ViewType): string {
        const start = this._gridLayoutCalculator.getScaleItemStart(index, scaleType);
        return this.getScaleItemTextByStart(start, scaleType);
    }
    getScaleItemTextByStart(start: Date, scaleType: ViewType): string {
        return this._elementTextHelper.getScaleItemText(start, scaleType);
    }
    getTextWidth(text: string): number {
        return this._elementTextHelper.getTextWidth(text);
    }

    getTaskVisibility(index: number): boolean {
        return this.gridLayoutCalculator.isTaskInRenderedRange(index) && this._elementTextHelper.getTaskVisibility(index);
    }
    getTaskResourcesVisibility(index: number): boolean {
        return this.getTaskVisibility(index) && !this.gridLayoutCalculator.isTaskCutByRange(index);
    }

    getScaleItemTextTemplate(viewType: ViewType): string {
        return this._elementTextHelper.getScaleItemTextTemplate(viewType);
    }

    getTaskText(index: number): string {
        return this._elementTextHelper.getTaskText(index);
    }


    taskAreaManagerDetachEvents(): void {
        this.taskAreaManager.detachEvents();
    }

    attachEventsOnTask(taskIndex: number): void {
        this.taskAreaManager.attachEventsOnTask(this._taskRender.taskElements[taskIndex]);
    }

    detachEventsOnTask(taskIndex: number): void {
        this.taskAreaManager.detachEventsOnTask(this._taskRender.taskElements[taskIndex]);
    }


}
