import { Size } from "@devexpress/utils/lib/geometry/size";
import { DateRange } from "../../Model/WorkingTime/DateRange";
import { ViewVisualModel } from "../../Model/VisualModel/VisualModel";
import { Position, ViewType } from "./Enums";
import { GridElementInfo } from "./GridElementInfo";
import { EtalonSizeValues } from "./EtalonSizeValues";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Task } from "../../Model/Entities/Task";
import { ViewVisualModelDependencyInfo } from "../../Model/VisualModel/ViewVisualModelDependencyInfo";
import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { DateUtils } from "../Utils/DateUtils";
import { StripLine } from "../Settings/StripLine";
import { StripLineSettings } from "../Settings/StripLineSettings";
import { DependencyType } from "../../Model/Entities/Enums";
import { ScaleCalculator, ScaleItemInfo } from "./ScaleCalculator";
import { isDefined } from "@devexpress/utils/lib/utils/common";

export class GridLayoutCalculator {
    public static dxGanttPrefix = "dx-gantt-";
    public static taskClassName = GridLayoutCalculator.dxGanttPrefix + "task";
    public static milestoneClassName = GridLayoutCalculator.dxGanttPrefix + "milestone";
    public static smallTaskClassName = GridLayoutCalculator.dxGanttPrefix + "smallTask";
    public static parentTaskClassName = GridLayoutCalculator.dxGanttPrefix + "parent";

    public static taskProgressClassName = GridLayoutCalculator.dxGanttPrefix + "tPrg";
    public static taskTitleClassName = GridLayoutCalculator.dxGanttPrefix + "taskTitle";
    public static titleInClassName = GridLayoutCalculator.dxGanttPrefix + "titleIn";
    public static titleOutClassName = GridLayoutCalculator.dxGanttPrefix + "titleOut";
    public static taskResourceClassName = GridLayoutCalculator.dxGanttPrefix + "taskRes";

    public static arrowClassName = GridLayoutCalculator.dxGanttPrefix + "arrow";
    public static leftArrowClassName = GridLayoutCalculator.dxGanttPrefix + "LA";
    public static topArrowClassName = GridLayoutCalculator.dxGanttPrefix + "TA";
    public static rightArrowClassName = GridLayoutCalculator.dxGanttPrefix + "RA";
    public static bottomArrowClassName = GridLayoutCalculator.dxGanttPrefix + "BA";

    visibleTaskAreaSize: Size;
    tickSize: Size;
    scaleHeight: number;
    verticalTickCount: number;
    range: DateRange;
    tickTimeSpan: number;
    viewModel: ViewVisualModel;
    protected _viewType: ViewType;
    tileToDependencyMap: Array<Array<GridElementInfo>> = [];
    tileToNoWorkingIntervalsMap: Array<Array<GridElementInfo>> = [];
    taskHeight: number;
    parentTaskHeight: number;
    milestoneWidth: number;
    arrowSize: Size;
    lineThickness: number;
    minLineLength = 10;
    minConnectorSpaceFromTask: number;
    resourceMaxWidth = 500;
    minTaskWidth = 2;
    elementSizeValues: EtalonSizeValues;
    scrollBarHeight: number;

    private _taskWrapperPoints = Array<Point>();
    private _taskElementInfoList = Array<GridElementInfo>();

    _scaleCalculator: ScaleCalculator = new ScaleCalculator();

    setSettings(visibleTaskAreaSize: Size, tickSize: Size, elementSizeValues: EtalonSizeValues,
        range: DateRange, viewModel: ViewVisualModel, viewType: ViewType, scrollBarHeight: number = 0, firstDayOfWeek: number = 0): void {
        this.visibleTaskAreaSize = visibleTaskAreaSize;
        this.tickSize = tickSize;
        this._viewType = viewType;
        this.range = range;
        this.verticalTickCount = viewModel.itemCount;
        this.viewModel = viewModel;
        this.elementSizeValues = elementSizeValues;
        this.taskHeight = elementSizeValues.taskHeight;
        this.parentTaskHeight = elementSizeValues.parentTaskHeight;
        this.milestoneWidth = elementSizeValues.milestoneWidth;
        this.scaleHeight = elementSizeValues.scaleItemHeight;
        this.arrowSize = new Size(elementSizeValues.connectorArrowWidth, elementSizeValues.connectorArrowWidth);
        this.lineThickness = elementSizeValues.connectorLineThickness;
        this.minConnectorSpaceFromTask = (this.tickSize.height - this.taskHeight) / 2;
        this.tickTimeSpan = DateUtils.getTickTimeSpan(viewType);
        this.scrollBarHeight = scrollBarHeight;
        this.createTileToNonWorkingIntervalsMap();
        this._scaleCalculator.setSettings(range, viewType, tickSize, firstDayOfWeek);
        this.reset();
    }
    public get viewType(): ViewType { return this._viewType; }
    public set viewType(value: ViewType) {
        if(this._viewType !== value) {
            this._viewType = value;
            this._scaleCalculator.setViewType(value);
        }
    }
    private reset(): void {
        this._taskWrapperPoints = new Array<Point>();
        this._taskElementInfoList = Array<GridElementInfo>();
    }
    public resetTaskInfo(index: number): void {
        delete this._taskWrapperPoints[index];
        delete this._taskElementInfoList[index];
    }
    getTaskAreaBorderInfo(index: number, isVertical: boolean): GridElementInfo {
        const sizeValue = isVertical ? this.getVerticalGridLineHeight() : this.getTotalWidth();
        return this.getGridBorderInfo(index, isVertical, sizeValue);
    }
    getTotalWidth(): number {
        return this._scaleCalculator.scaleWidth;
    }
    getScaleBorderInfo(index: number, scaleType: ViewType): GridElementInfo {
        const result = new GridElementInfo();
        const calc = this._scaleCalculator;
        result.setPosition(new Point(calc.getScaleBorderPosition(index, scaleType), undefined));
        result.setSize(new Size(0, this.scaleHeight));
        result.className = "dx-gantt-vb";
        return result;
    }
    getGridBorderInfo(index: number, isVertical: boolean, size?: number): GridElementInfo {
        const result = new GridElementInfo();
        result.setPosition(this.getGridBorderPosition(index, isVertical));
        if(size)
            result.setSize(this.getGridBorderSize(isVertical, size));
        result.className = isVertical ? "dx-gantt-vb" : "dx-gantt-hb";
        return result;
    }
    getGridBorderPosition(index: number, isVertical: boolean): Point {
        const result = new Point(undefined, undefined);
        const calc = this._scaleCalculator;
        const posValue = isVertical ? calc.getScaleBorderPosition(index, this.viewType) : (index + 1) * this.tickSize.height;
        if(isVertical)
            result.x = posValue;
        else
            result.y = posValue;
        return result;
    }
    getGridBorderSize(isVertical: boolean, sizeValue: number): Size {
        const result = new Size(0, 0);
        if(isVertical)
            result.height = sizeValue;
        else
            result.width = sizeValue;
        return result;
    }
    getScaleElementInfo(index: number, scaleType: ViewType): GridElementInfo {
        const result = new GridElementInfo();
        const item = this.getScaleItemInfo(index, scaleType);
        if(item) {
            result.setPosition(item.position);
            result.setSize(item.size);
            result.className = this.getScaleItemClassName(scaleType, result, this.getRenderedNoWorkingIntervals(result.position.x));
            const calc = this._scaleCalculator;
            const items = calc.getScaleItems(scaleType);
            const needEllipsis = index === 0 || index === items.length - 1;
            if(needEllipsis) {
                result.style["overflowX"] = "hidden";
                result.style["textOverflow"] = "ellipsis";
            }
            result.additionalInfo["range"] = new DateRange(item.start, item.end);
        }
        return result;
    }
    getScaleItemStart(index: number, scaleType: ViewType): Date {
        return this._scaleCalculator.getScaleItemAdjustedStart(index, scaleType);
    }
    getScaleItemClassName(scaleType: ViewType, scaleItemInfo: GridElementInfo, noWorkingIntervals: Array<GridElementInfo>): string {
        let result = "dx-gantt-si";
        if(scaleType.valueOf() == this.viewType.valueOf() && this.isScaleItemInsideNoWorkingInterval(scaleItemInfo, noWorkingIntervals))
            result += " dx-gantt-holiday-scaleItem";
        return result;
    }
    getScaleItemInfo(index: number, scaleType: ViewType): ScaleItemInfo {
        return this._scaleCalculator.getScaleItem(index, scaleType);
    }
    getScaleRangesInArea(left: number, right: number): number[][] {
        const topScale = DateUtils.ViewTypeToScaleMap[this.viewType];
        const calc = this._scaleCalculator;

        const topStartIndex = Math.max(calc.getScaleIndexByPos(left, topScale), 0);
        let topEndIndex = calc.getScaleIndexByPos(right, topScale);
        if(topEndIndex === -1)
            topEndIndex = calc.topScaleItems.length - 1;

        const bottomStartIndex = Math.max(calc.getScaleIndexByPos(left), 0);
        let bottomEndIndex = calc.getScaleIndexByPos(right);
        if(bottomEndIndex === -1)
            bottomEndIndex = calc.bottomScaleItems.length - 1;

        return [
            [topStartIndex, topEndIndex],
            [bottomStartIndex, bottomEndIndex]
        ];
    }

    isScaleItemInsideNoWorkingInterval(scaleItemInfo: GridElementInfo, noWorkingIntervals: Array<GridElementInfo>): boolean {
        const scaleItemLeft = scaleItemInfo.position.x;
        const scaleItemRight = scaleItemInfo.position.x + scaleItemInfo.size.width;
        for(let i = 0; i < noWorkingIntervals.length; i++) {
            const noWorkingIntervalLeft = noWorkingIntervals[i].position.x;
            const noWorkingIntervalRight = noWorkingIntervals[i].position.x + noWorkingIntervals[i].size.width;
            if(scaleItemLeft >= noWorkingIntervalLeft && scaleItemRight <= noWorkingIntervalRight)
                return true;
        }
        return false;
    }
    getScaleItemColSpan(scaleType: ViewType): number {
        return this._scaleCalculator.getScaleItemColSpan(scaleType);
    }
    getTaskWrapperElementInfo(index: number): GridElementInfo {
        const result = new GridElementInfo();
        result.className = this.getTaskWrapperClassName(index);
        result.setPosition(this.getTaskWrapperPoint(index));
        result.setAttribute("task-index", index);
        return result;
    }
    getTaskWrapperClassName(index: number): string {
        let result = "dx-gantt-taskWrapper";
        const viewItem = this.getViewItem(index);
        if(viewItem.task.isMilestone() && !viewItem.isCustom)
            result = "dx-gantt-milestoneWrapper";
        if(viewItem.selected)
            result += " dx-gantt-selectedTask";
        return result;
    }
    getTaskWrapperPoint(index: number): Point {
        if(!isDefined(this._taskWrapperPoints[index])) {
            const viewItem = this.getViewItem(index);
            const height = this.getTaskHeight(index);
            const y = index * this.tickSize.height + (this.tickSize.height - height) / 2;
            const result = new Point(
                this.getPosByDate(viewItem.task.start),
                y
            );
            if(viewItem.task.isMilestone() && !viewItem.isCustom)
                result.x -= height / 2;
            this._taskWrapperPoints[index] = result;
        }
        return this._taskWrapperPoints[index].clone();
    }
    getTaskElementInfo(index: number, textOutsideTask: boolean = false): GridElementInfo {
        if(!isDefined(this._taskElementInfoList[index])) {
            const result = new GridElementInfo();
            const task = this.getTask(index);
            const autoCalculatedParent = this.viewModel.parentAutoCalc && this.viewModel.taskHasChildrenByIndex(index);
            if(!task.isMilestone()) {
                const defWidth = this.getTaskWidth(index);
                result.size.width = this.getCorrectedTaskWidthByRange(index, defWidth);
                if(result.size.width < defWidth)
                    result.additionalInfo["taskCut"] = true;
                if(textOutsideTask)
                    result.size.height = this.getTaskHeight(index);
            }
            result.className = this.getTaskClassName(index, result.size.width);
            if(task.color) {
                result.style.backgroundColor = task.color;
                if(autoCalculatedParent) {
                    result.style.borderLeftColor = task.color;
                    result.style.borderRightColor = task.color;
                    result.style.borderTopColor = task.color;
                }
            }
            this._taskElementInfoList[index] = result;
        }
        return this._taskElementInfoList[index];
    }
    getTaskClassName(index: number, taskWidth: number): string {
        let result = GridLayoutCalculator.taskClassName;
        const viewItem = this.getViewItem(index);
        const autoCalculatedParent = this.viewModel.parentAutoCalc && this.viewModel.taskHasChildrenByIndex(index);

        if(viewItem.task.isMilestone() && !viewItem.isCustom)
            result += " " + GridLayoutCalculator.milestoneClassName;
        else {
            if(taskWidth <= this.elementSizeValues.smallTaskWidth)
                result += " " + GridLayoutCalculator.smallTaskClassName;
            if(autoCalculatedParent)
                result += this.getAutoCalcParentTaskClassName(viewItem.task);
        }

        return result;
    }
    getAutoCalcParentTaskClassName(task: Task): string {
        let result = " " + GridLayoutCalculator.parentTaskClassName;
        if(task.progress == 0)
            result += " dx-gantt-noPrg";
        if(task.progress >= 100)
            result += " dx-gantt-cmpl";
        return result;
    }
    getTaskPoint(index: number): Point {
        const result = this.getTaskWrapperPoint(index);
        if(!this.getTask(index).isMilestone())
            result.y += this.elementSizeValues.taskWrapperTopPadding;

        return result;
    }
    getTaskSize(index: number): Size {
        return new Size(this.getTaskWidth(index), this.getTaskHeight(index));
    }
    getTaskWidth(index: number): number {
        const viewItem = this.getViewItem(index);
        if(viewItem.isCustom && viewItem.size.width)
            return viewItem.size.width;
        return viewItem.task.isMilestone() && !viewItem.isCustom ? this.getTaskHeight(index) : Math.max(this.getWidthByDateRange(viewItem.task.start, viewItem.task.end), this.minTaskWidth);
    }
    getTaskHeight(index: number): number {
        const viewItem = this.getViewItem(index);
        if(viewItem.task.isMilestone() && !viewItem.isCustom)
            return this.milestoneWidth;
        if(this.viewModel.isTaskToCalculateByChildren(viewItem.task.internalId))
            return this.parentTaskHeight;
        return (viewItem.isCustom && viewItem.size.height) ? viewItem.size.height : this.taskHeight;
    }
    getTask(index: number): Task {
        const item = this.getViewItem(index);
        return item?.task;
    }
    getViewItem(index: number): ViewVisualModelItem {
        return this.viewModel.items[index];
    }
    getTaskProgressElementInfo(index: number): GridElementInfo {
        const result = new GridElementInfo();
        result.className = GridLayoutCalculator.taskProgressClassName;
        result.setSize(this.getTaskProgressSize(index));
        return result;
    }
    getTaskProgressSize(index: number): Size {
        let width = this.getTaskProgressWidth(index);
        if(this.isTaskCutByRange(index))
            width = this.getCorrectedTaskWidthByRange(index, width);
        return new Size(width, 0);
    }
    getTaskProgressWidth(index: number): number {
        return this.getTaskWidth(index) * this.getTask(index).normalizedProgress / 100;
    }
    getTaskTextElementInfo(index: number, isInsideText: boolean): GridElementInfo {
        const result = new GridElementInfo();
        result.className = this.getTaskTextElementClassName(isInsideText);
        if(!isInsideText) {
            const taskX = this.getTaskPoint(index).x;
            if(taskX < this.elementSizeValues.outsideTaskTextDefaultWidth) {
                const width = Math.max(taskX, 0);
                result.size.width = width;
                if(width > 0)
                    result.margins.left = -width;
                else
                    result.additionalInfo["hidden"] = true;
            }
        }
        return result;
    }
    getTaskTextElementClassName(isInsideText: boolean): string {
        return GridLayoutCalculator.taskTitleClassName.concat(" ", isInsideText ? GridLayoutCalculator.titleInClassName : GridLayoutCalculator.titleOutClassName);
    }
    getTaskResourcesWrapperElementInfo(index: number): GridElementInfo {
        const result = new GridElementInfo();
        const width = this.getTaskSize(index).width;
        result.className = "dx-gantt-taskResWrapper";
        result.setPosition(this.getTaskWrapperPoint(index));
        result.position.x = result.position.x + width;
        return result;
    }
    getTaskResourceElementInfo(): GridElementInfo {
        const result = new GridElementInfo();
        result.className = GridLayoutCalculator.taskResourceClassName;
        return result;
    }
    getSelectionElementInfo(index: number): GridElementInfo {
        return this.getRowElementInfo(index, "dx-gantt-sel");
    }
    getSelectionPosition(index: number): Point {
        const result = new Point(undefined, undefined);
        result.y = index * this.tickSize.height;
        return result;
    }
    getSelectionSize(): Size {
        return new Size(this.getTotalWidth(), this.tickSize.height);
    }
    getHighlightRowInfo(index: number): GridElementInfo {
        return this.getRowElementInfo(index, "dx-gantt-altRow");
    }
    getRowElementInfo(index: number, className: string): GridElementInfo {
        const result = new GridElementInfo();
        result.className = className;
        result.setPosition(this.getSelectionPosition(index));
        result.setSize(this.getSelectionSize());
        return result;
    }
    getNoWorkingIntervalInfo(noWorkingDateRange: DateRange): GridElementInfo {
        const result = new GridElementInfo();
        result.className = "dx-gantt-nwi";
        result.setPosition(this.getNoWorkingIntervalPosition(noWorkingDateRange.start));
        result.setSize(this.getNoWorkingIntervalSize(noWorkingDateRange));
        return result;
    }
    getNoWorkingIntervalPosition(intervalStart: Date): Point {
        const result = new Point(undefined, undefined);
        result.x = this.getPosByDate(intervalStart);
        return result;
    }
    getNoWorkingIntervalSize(noWorkingInterval: DateRange): Size {
        return new Size(
            this.getWidthByDateRange(noWorkingInterval.start, noWorkingInterval.end),
            this.getVerticalGridLineHeight()
        );
    }
    getVerticalGridLineHeight(): number {
        return Math.max(this.visibleTaskAreaSize.height - this.scrollBarHeight, this.tickSize.height * this.verticalTickCount);
    }
    getConnectorInfo(id: string, predessorIndex: number, successorIndex: number, connectorType: DependencyType): Array<GridElementInfo> {
        const result = new Array<GridElementInfo>();
        const connectorPoints = this.getConnectorPoints(predessorIndex, successorIndex, connectorType);
        for(let i = 0; i < connectorPoints.length - 1; i++)
            result.push(this.getConnectorLineInfo(id, connectorPoints[i], connectorPoints[i + 1], i == 0 || i == connectorPoints.length - 2));
        result.push(this.getArrowInfo(id, connectorPoints, result, predessorIndex, successorIndex));
        this.checkAndCorrectConnectorLinesByRange(result);
        return result.filter(c => !!c);
    }
    getConnectorLineInfo(id: string, startPoint: Point, endPoint: Point, isEdgeLine: boolean): GridElementInfo {
        const result = new GridElementInfo();
        const isVertical = startPoint.x == endPoint.x;
        result.className = this.getConnectorClassName(isVertical);
        result.setPosition(this.getConnectorPosition(startPoint, endPoint));
        result.setSize(this.getConnectorSize(startPoint, endPoint, isVertical, isEdgeLine));
        result.setAttribute("dependency-id", id);
        return result;
    }
    getConnectorClassName(isVertical: boolean): string {
        return isVertical ? GridLayoutCalculator.CLASSNAMES.CONNECTOR_VERTICAL : GridLayoutCalculator.CLASSNAMES.CONNECTOR_HORIZONTAL;
    }
    getConnectorPosition(startPoint: Point, endPoint: Point): Point {
        return new Point(Math.min(startPoint.x, endPoint.x), Math.min(startPoint.y, endPoint.y));
    }
    getConnectorSize(startPoint: Point, endPoint: Point, isVertical: boolean, isEdgeLine: boolean): Size {
        const result = new Size(0, 0);
        const sizeCorrection = isEdgeLine ? 0 : 1;
        if(isVertical)
            result.height = Math.abs(endPoint.y - startPoint.y) + sizeCorrection;
        else
            result.width = Math.abs(endPoint.x - startPoint.x) + sizeCorrection;
        return result;
    }
    getArrowInfo(id: string, connectorPoints: Array<Point>, connectorLines: Array<GridElementInfo>, predessorIndex: number, successorIndex: number): GridElementInfo {
        const result = new GridElementInfo();
        const lineInfo = this.findArrowLineInfo(connectorLines, predessorIndex, successorIndex);
        const arrowPosition = this.getArrowPosition(connectorPoints, predessorIndex, successorIndex);
        result.className = this.getArrowClassName(arrowPosition);
        result.setPosition(this.getArrowPoint(lineInfo, arrowPosition));
        result.setAttribute("dependency-id", id);
        return result;
    }
    findArrowLineInfo(connectorLines: Array<GridElementInfo>, predessorIndex: number, successorIndex: number): GridElementInfo {
        const arrowLineIndex = predessorIndex < successorIndex ? connectorLines.length - 1 : 0;
        return connectorLines[arrowLineIndex];
    }
    getArrowPosition(connectorPoints: Array<Point>, predessorIndex: number, successorIndex: number): Position {
        const prevLastPoint = connectorPoints[predessorIndex < successorIndex ? connectorPoints.length - 2 : 1];
        const lastPoint = connectorPoints[predessorIndex < successorIndex ? connectorPoints.length - 1 : 0];
        if(prevLastPoint.x == lastPoint.x)
            return prevLastPoint.y > lastPoint.y ? Position.Top : Position.Bottom;
        return prevLastPoint.x > lastPoint.x ? Position.Left : Position.Right;
    }
    getArrowClassName(arrowPosition: Position): string {
        let result = GridLayoutCalculator.arrowClassName;
        switch(arrowPosition) {
            case Position.Left:
                result = result.concat(" ", GridLayoutCalculator.leftArrowClassName);
                break;
            case Position.Top:
                result = result.concat(" ", GridLayoutCalculator.topArrowClassName);
                break;
            case Position.Right:
                result = result.concat(" ", GridLayoutCalculator.rightArrowClassName);
                break;
            case Position.Bottom:
                result = result.concat(" ", GridLayoutCalculator.bottomArrowClassName);
                break;
        }
        return result;
    }
    getArrowPositionByClassName(className: string): Position {
        if(className.indexOf(GridLayoutCalculator.leftArrowClassName) > -1)
            return Position.Left;
        if(className.indexOf(GridLayoutCalculator.topArrowClassName) > -1)
            return Position.Top;
        if(className.indexOf(GridLayoutCalculator.rightArrowClassName) > -1)
            return Position.Right;
        if(className.indexOf(GridLayoutCalculator.bottomArrowClassName) > -1)
            return Position.Bottom;
    }
    getArrowPoint(lineInfo: GridElementInfo, arrowPosition: Position): Point {
        return new Point(
            this.getArrowX(lineInfo, arrowPosition),
            this.getArrowY(lineInfo, arrowPosition)
        );
    }
    getArrowX(lineInfo: GridElementInfo, arrowPosition: Position): number {
        switch(arrowPosition) {
            case Position.Left:
                return lineInfo.position.x - this.arrowSize.width / 2;
            case Position.Right:
                return lineInfo.position.x + lineInfo.size.width - this.arrowSize.width / 2;
            case Position.Top:
            case Position.Bottom:
                return lineInfo.position.x - (this.arrowSize.width - this.lineThickness) / 2;
        }
    }
    getArrowY(lineInfo: GridElementInfo, arrowPosition: Position): number {
        switch(arrowPosition) {
            case Position.Top:
                return lineInfo.position.y - this.arrowSize.height / 2;
            case Position.Bottom:
                return lineInfo.position.y + lineInfo.size.height - this.arrowSize.height / 2;
            case Position.Left:
            case Position.Right:
                return lineInfo.position.y - (this.arrowSize.height - this.lineThickness) / 2;
        }
    }
    getPosByDate(date: Date): number {
        return this.getWidthByDateRange(this.range.start, date);
    }
    getWidthByDateRange(start: Date, end: Date): number {
        return DateUtils.getRangeTickCount(start, end, this.viewType) * this.tickSize.width;
    }
    getDateByPos(position: number): Date {
        if(this.viewType === ViewType.Months || this.viewType === ViewType.Quarter)
            return this.getDateByPosInMonthBasedViewTypes(position);
        const preResult = position / this.tickSize.width;
        const start = new Date(this.range.start);
        return DateUtils.getDSTCorrectedTaskEnd(start, preResult * this.tickTimeSpan);
    }
    getDateByPosInMonthBasedViewTypes(position: number): Date {
        return this._scaleCalculator.getDateInScale(position);
    }
    getConnectorPoints(predessorIndex: number, successorIndex: number, connectorType: DependencyType): Array<Point> {
        switch(connectorType) {
            case DependencyType.FS:
                return this.getFinishToStartConnectorPoints(predessorIndex, successorIndex);
            case DependencyType.SF:
                return this.getStartToFinishConnectorPoints(predessorIndex, successorIndex);
            case DependencyType.SS:
                return this.getStartToStartConnectorPoints(predessorIndex, successorIndex);
            case DependencyType.FF:
                return this.getFinishToFinishConnectorPoints(predessorIndex, successorIndex);
            default:
                return new Array<Point>();
        }
    }
    getFinishToStartConnectorPoints(predessorIndex: number, successorIndex: number): Array<Point> {
        if(predessorIndex < successorIndex) {
            if(this.getTask(predessorIndex).end <= this.getTask(successorIndex).start)
                return this.getConnectorPoints_FromTopTaskRightSide_ToBottomTaskTopSide(predessorIndex, successorIndex, false);
            return this.getConnectorPoints_FromTopTaskRightSide_ToBottomTaskLeftSide(predessorIndex, successorIndex, false);
        }

        if(this.getTask(predessorIndex).end <= this.getTask(successorIndex).start)
            return this.getConnectorPoints_FromTopTaskBottomSide_ToBottomTaskRightSide(successorIndex, predessorIndex, false);
        return this.getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskRightSide(successorIndex, predessorIndex, true);

    }
    getFinishToFinishConnectorPoints(predessorIndex: number, successorIndex: number): Array<Point> {
        if(predessorIndex < successorIndex)
            return this.getConnectorPoints_FromTopTaskRightSide_ToBottomTaskRightSide(predessorIndex, successorIndex);

        return this.getConnectorPoints_FromTopTaskRightSide_ToBottomTaskRightSide(successorIndex, predessorIndex);

    }
    getStartToStartConnectorPoints(predessorIndex: number, successorIndex: number): Array<Point> {
        if(predessorIndex < successorIndex)
            return this.getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskLeftSide(predessorIndex, successorIndex);

        return this.getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskLeftSide(successorIndex, predessorIndex);

    }
    getStartToFinishConnectorPoints(predessorIndex: number, successorIndex: number): Array<Point> {
        if(predessorIndex < successorIndex) {
            if(this.getTask(predessorIndex).start >= this.getTask(successorIndex).end)
                return this.getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskTopSide(predessorIndex, successorIndex, true);
            return this.getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskRightSide(predessorIndex, successorIndex, false);
        }

        if(this.getTask(predessorIndex).start >= this.getTask(successorIndex).end)
            return this.getConnectorPoints_FromTopTaskBottomSide_ToBottomTaskLeftSide(successorIndex, predessorIndex, true);
        return this.getConnectorPoints_FromTopTaskRightSide_ToBottomTaskLeftSide(successorIndex, predessorIndex, true);

    }
    getConnectorPoints_FromTopTaskRightSide_ToBottomTaskTopSide(topTaskIndex: number, bottomTaskIndex: number, shiftEndPointToRight: boolean): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskRightCenter = this.getTaskRightCenter(topTaskPoint, topTaskIndex);
        const isBottomMilestone = this.getTask(bottomTaskIndex).isMilestone();
        const bottomTaskTopCenter = this.getTaskTopCenter(bottomTaskPoint, bottomTaskIndex);
        const endPointIndent = this.getHorizontalIndentFromTaskEdge(bottomTaskIndex, shiftEndPointToRight);
        result.push(new Point(Math.floor(topTaskRightCenter.x), Math.floor(topTaskRightCenter.y)));
        result.push(new Point(Math.floor(isBottomMilestone ? bottomTaskTopCenter.x : bottomTaskPoint.x + endPointIndent), Math.floor(result[0].y)));
        result.push(new Point(Math.floor(result[1].x), Math.floor(bottomTaskTopCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskRightSide_ToBottomTaskRightSide(topTaskIndex: number, bottomTaskIndex: number): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskRightCenter = this.getTaskRightCenter(topTaskPoint, topTaskIndex);
        const bottomTaskRightCenter = this.getTaskRightCenter(bottomTaskPoint, bottomTaskIndex);
        result.push(new Point(Math.floor(topTaskRightCenter.x), Math.floor(topTaskRightCenter.y)));
        result.push(new Point(Math.floor(Math.max(topTaskRightCenter.x, bottomTaskRightCenter.x) + this.minLineLength), Math.floor(result[0].y)));
        result.push(new Point(Math.floor(result[1].x), Math.floor(bottomTaskRightCenter.y)));
        result.push(new Point(Math.floor(bottomTaskRightCenter.x), Math.floor(bottomTaskRightCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskRightSide_ToBottomTaskLeftSide(topTaskIndex: number, bottomTaskIndex: number, shiftToTop: boolean): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskRightCenter = this.getTaskRightCenter(topTaskPoint, topTaskIndex);
        const topTaskBottomCenter = this.getTaskBottomCenter(topTaskPoint, topTaskIndex);
        const bottomTaskLeftCenter = this.getTaskLeftCenter(bottomTaskPoint, bottomTaskIndex);
        const bottomTaskTopCenter = this.getTaskTopCenter(bottomTaskPoint, bottomTaskIndex);
        const viewItem = shiftToTop ? this.getViewItem(topTaskIndex) : this.getViewItem(bottomTaskIndex);
        const connectorSpace = viewItem.isCustom ? (this.tickSize.height - viewItem.size.height) / 2 : this.minConnectorSpaceFromTask;
        result.push(new Point(Math.floor(topTaskRightCenter.x), Math.floor(topTaskRightCenter.y)));
        result.push(new Point(Math.floor(result[0].x + this.minLineLength), Math.floor(result[0].y)));
        result.push(new Point(Math.floor(result[1].x), Math.floor(shiftToTop ?
            topTaskBottomCenter.y + connectorSpace
            : bottomTaskTopCenter.y - connectorSpace)));
        result.push(new Point(Math.floor(bottomTaskLeftCenter.x - this.minLineLength), Math.floor(result[2].y)));
        result.push(new Point(Math.floor(result[3].x), Math.floor(bottomTaskLeftCenter.y)));
        result.push(new Point(Math.floor(bottomTaskLeftCenter.x), Math.floor(bottomTaskLeftCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskBottomSide_ToBottomTaskRightSide(topTaskIndex: number, bottomTaskIndex: number, shiftStartPointToRight: boolean): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskBottomCenter = this.getTaskBottomCenter(topTaskPoint, topTaskIndex);
        const isTopMilestone = this.getTask(topTaskIndex).isMilestone();
        const bottomTaskRightCenter = this.getTaskRightCenter(bottomTaskPoint, bottomTaskIndex);
        const startPointIndent = this.getHorizontalIndentFromTaskEdge(topTaskIndex, shiftStartPointToRight);
        result.push(new Point(Math.floor(isTopMilestone ? topTaskBottomCenter.x : topTaskPoint.x + startPointIndent), Math.floor(topTaskBottomCenter.y)));
        result.push(new Point(Math.floor(result[0].x), Math.floor(bottomTaskRightCenter.y)));
        result.push(new Point(Math.floor(bottomTaskRightCenter.x), Math.floor(bottomTaskRightCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskBottomSide_ToBottomTaskLeftSide(topTaskIndex: number, bottomTaskIndex: number, shiftStartPointToRight: boolean): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskBottomCenter = this.getTaskBottomCenter(topTaskPoint, topTaskIndex);
        const isTopMilestone = this.getTask(topTaskIndex).isMilestone();
        const bottomTaskLeftCenter = this.getTaskLeftCenter(bottomTaskPoint, bottomTaskIndex);
        const startPointIndent = this.getHorizontalIndentFromTaskEdge(topTaskIndex, shiftStartPointToRight);
        result.push(new Point(Math.floor(isTopMilestone ? topTaskBottomCenter.x : topTaskPoint.x + startPointIndent), Math.floor(topTaskBottomCenter.y)));
        result.push(new Point(Math.floor(result[0].x), Math.floor(bottomTaskLeftCenter.y)));
        result.push(new Point(Math.floor(bottomTaskLeftCenter.x), Math.floor(bottomTaskLeftCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskTopSide(topTaskIndex: number, bottomTaskIndex: number, shiftEndPointToRight: boolean): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskLeftCenter = this.getTaskLeftCenter(topTaskPoint, topTaskIndex);
        const bottomTaskTopCenter = this.getTaskTopCenter(bottomTaskPoint, bottomTaskIndex);
        const isBottomMilestone = this.getTask(bottomTaskIndex).isMilestone();
        const endPointIndent = this.getHorizontalIndentFromTaskEdge(bottomTaskIndex, shiftEndPointToRight);
        result.push(new Point(Math.floor(topTaskLeftCenter.x), Math.floor(topTaskLeftCenter.y)));
        result.push(new Point(Math.floor(isBottomMilestone ? bottomTaskTopCenter.x : bottomTaskPoint.x + endPointIndent), Math.floor(result[0].y)));
        result.push(new Point(Math.floor(result[1].x), Math.floor(bottomTaskTopCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskRightSide(topTaskIndex: number, bottomTaskIndex: number, shiftToTop: boolean): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskLeftCenter = this.getTaskLeftCenter(topTaskPoint, topTaskIndex);
        const topTaskBottomCenter = this.getTaskBottomCenter(topTaskPoint, topTaskIndex);
        const bottomTaskRightCenter = this.getTaskRightCenter(bottomTaskPoint, bottomTaskIndex);
        const bottomTaskTopCenter = this.getTaskTopCenter(bottomTaskPoint, bottomTaskIndex);
        const viewItem = shiftToTop ? this.getViewItem(topTaskIndex) : this.getViewItem(bottomTaskIndex);
        const connectorSpace = viewItem.isCustom ? (this.tickSize.height - viewItem.size.height) / 2 : this.minConnectorSpaceFromTask;
        result.push(new Point(Math.floor(topTaskLeftCenter.x), topTaskLeftCenter.y));
        result.push(new Point(Math.floor(result[0].x - this.minLineLength), result[0].y));
        result.push(new Point(Math.floor(result[1].x), Math.floor(shiftToTop ?
            topTaskBottomCenter.y + connectorSpace
            : bottomTaskTopCenter.y - connectorSpace)));
        result.push(new Point(Math.floor(bottomTaskRightCenter.x + this.minLineLength), Math.floor(result[2].y)));
        result.push(new Point(Math.floor(result[3].x), Math.floor(bottomTaskRightCenter.y)));
        result.push(new Point(Math.floor(bottomTaskRightCenter.x), Math.floor(bottomTaskRightCenter.y)));
        return result;
    }
    getConnectorPoints_FromTopTaskLeftSide_ToBottomTaskLeftSide(topTaskIndex: number, bottomTaskIndex: number): Array<Point> {
        const result = new Array<Point>();
        const topTaskPoint = this.getTaskPoint(topTaskIndex);
        const bottomTaskPoint = this.getTaskPoint(bottomTaskIndex);
        const topTaskLeftCenter = this.getTaskLeftCenter(topTaskPoint, topTaskIndex);
        const bottomTaskLeftCenter = this.getTaskLeftCenter(bottomTaskPoint, bottomTaskIndex);
        result.push(new Point(Math.floor(topTaskLeftCenter.x), Math.floor(topTaskLeftCenter.y)));
        result.push(new Point(Math.floor(Math.min(topTaskLeftCenter.x, bottomTaskLeftCenter.x) - this.minLineLength), Math.floor(result[0].y)));
        result.push(new Point(Math.floor(result[1].x), Math.floor(bottomTaskLeftCenter.y)));
        result.push(new Point(Math.floor(bottomTaskLeftCenter.x), Math.floor(bottomTaskLeftCenter.y)));
        return result;
    }
    public getTaskSidePoints(index: number): Array<Point> {
        const point = this.getTaskPoint(index);
        return [
            this.getTaskLeftCenter(point, index),
            this.getTaskTopCenter(point, index),
            this.getTaskRightCenter(point, index),
            this.getTaskBottomCenter(point, index)
        ];
    }
    getTaskLeftCenter(taskPoint: Point, index: number): Point {
        return new Point(taskPoint.x - this.getTaskEdgeCorrection(index), taskPoint.y + this.getTaskHeight(index) / 2);
    }
    getTaskRightCenter(taskPoint: Point, index: number): Point {
        return new Point(taskPoint.x + this.getTaskWidth(index) + this.getTaskEdgeCorrection(index), taskPoint.y + this.getTaskHeight(index) / 2);
    }
    getTaskTopCenter(taskPoint: Point, index: number): Point {
        return new Point(taskPoint.x + this.getTaskWidth(index) / 2, taskPoint.y - this.getTaskEdgeCorrection(index));
    }
    getTaskBottomCenter(taskPoint: Point, index: number): Point {
        return new Point(taskPoint.x + this.getTaskWidth(index) / 2, taskPoint.y + this.getTaskHeight(index) + this.getTaskEdgeCorrection(index));
    }
    getTaskEdgeCorrection(index: number): number {
        const viewItem = this.getViewItem(index);
        const isMilestone = viewItem.task.isMilestone() && !viewItem.isCustom;
        return isMilestone ? this.getTaskHeight(index) * (Math.sqrt(2) - 1) / 2 : 0;
    }
    getHorizontalIndentFromTaskEdge(index: number, shiftToRight: boolean = false): number {
        const taskWidth = this.getTaskWidth(index);
        const indentFromEdge = this.minLineLength < taskWidth / 3 ? this.minLineLength : 0.2 * taskWidth;
        return shiftToRight ? taskWidth - indentFromEdge : indentFromEdge;
    }
    getRenderedRowColumnIndices(scrollPos: number, isVertical: boolean): Array<number> {
        const visibleAreaSizeValue = isVertical ? this.visibleTaskAreaSize.height : this.visibleTaskAreaSize.width;
        const firstVisibleIndex = isVertical ? this.getFirstVisibleGridCellIndex(scrollPos, this.tickSize.height) : this.getFirstScaleVisibleIndex(scrollPos);
        const lastVisibleIndex = isVertical ? this.getLastVisibleGridCellIndex(scrollPos, this.tickSize.height, visibleAreaSizeValue, this.verticalTickCount) : this.getLastScaleVisibleIndex(scrollPos);
        const result: Array<number> = new Array<number>();
        for(let i = firstVisibleIndex; i <= lastVisibleIndex; i++)
            result.push(i);
        return result;
    }
    getRenderedScaleItemIndices(scaleType: ViewType, renderedColIndices: Array<number>): Array<number> {
        const isBottomScale = scaleType === this.viewType;
        const calc = this._scaleCalculator;
        const firstRenderedIndex = renderedColIndices[0];
        const lastRenderedIndex = renderedColIndices[renderedColIndices.length - 1];
        const firstVisibleIndex = isBottomScale ? firstRenderedIndex : calc.getTopScaleIndexByBottomIndex(firstRenderedIndex);
        const lastVisibleIndex = isBottomScale ? lastRenderedIndex : calc.getTopScaleIndexByBottomIndex(lastRenderedIndex);
        const result: Array<number> = new Array<number>();
        for(let i = firstVisibleIndex; i <= lastVisibleIndex; i++)
            result.push(i);
        return result;
    }
    getFirstScaleVisibleIndex(scrollPos: number): number {
        return this._scaleCalculator.getFirstScaleIndexForRender(scrollPos);
    }
    getLastScaleVisibleIndex(scrollPos: number): number {
        return this._scaleCalculator.getLastScaleIndexForRender(scrollPos + this.visibleTaskAreaSize.width);
    }
    getFirstVisibleGridCellIndex(scrollPos: number, tickSizeValue: number): number {
        let result = Math.floor(scrollPos / tickSizeValue);
        result = Math.max(result - 10, 0);
        return result;
    }
    getLastVisibleGridCellIndex(scrollPos: number, tickSizeValue: number, visibleAreaSizeValue: number, tickCount: number): number {
        let result = Math.floor((scrollPos + visibleAreaSizeValue) / tickSizeValue);
        result = Math.min(result + 10, tickCount - 1);
        return result;
    }
    createTileToConnectorLinesMap(): void {
        this.tileToDependencyMap = [];
        for(let i = 0; i < this.viewModel.items.length; i++)
            for(let j = 0; j < this.viewModel.items[i].dependencies.length; j++)
                this.createConnecotInfo(this.viewModel.items[i].dependencies[j], this.viewModel.items[i].visibleIndex);

    }
    updateTileToConnectorLinesMap(dependencyId: string): GridElementInfo[] {
        this.tileToDependencyMap.forEach(function(map, index, tileToDependencyMap) {
            tileToDependencyMap[index] = map.filter(info => info.attr["dependency-id"] != dependencyId);
        });
        let result: GridElementInfo[] = [];
        const item = this.viewModel.items.filter(item => item.dependencies.filter(d => d.id == dependencyId).length > 0)[0];
        if(item) {
            const dependency = item.dependencies.filter(d => d.id === dependencyId)[0];
            result = this.createConnecotInfo(dependency, item.visibleIndex);
        }
        return result;
    }
    createConnecotInfo(dependencyInfo: ViewVisualModelDependencyInfo, successorIndex: number): Array<GridElementInfo> {
        const predessorIndex = dependencyInfo.predecessor.visibleIndex;
        const type = dependencyInfo.type;
        const id = dependencyInfo.id;
        const connectorInfo = this.getConnectorInfo(id, predessorIndex, successorIndex, type);
        connectorInfo.forEach(connectorLine => {
            this.addElementInfoToTileMap(connectorLine, this.tileToDependencyMap, true);
        });
        return connectorInfo;
    }
    createTileToNonWorkingIntervalsMap(): void {
        this.tileToNoWorkingIntervalsMap = [];
        for(let i = 0; i < this.viewModel.noWorkingIntervals.length; i++) {
            const noWorkingDateRange = this.getAdjustedNoWorkingInterval(this.viewModel.noWorkingIntervals[i]);
            if(!noWorkingDateRange) continue;
            const noWorkingIntervalInfo = this.getNoWorkingIntervalInfo(noWorkingDateRange);
            this.addElementInfoToTileMap(noWorkingIntervalInfo, this.tileToNoWorkingIntervalsMap, false);
        }
    }
    getAdjustedNoWorkingInterval(modelInterval: DateRange): DateRange {
        if(modelInterval.end.getTime() - modelInterval.start.getTime() < this.tickTimeSpan - 1)
            return null;
        return new DateRange(
            DateUtils.getNearestScaleTickDate(modelInterval.start, this.range, this.tickTimeSpan, this.viewType),
            DateUtils.getNearestScaleTickDate(modelInterval.end, this.range, this.tickTimeSpan, this.viewType)
        );
    }
    addElementInfoToTileMap(info: GridElementInfo, map: Array<Array<GridElementInfo>>, isVerticalTile: boolean): void {
        const infoPointValue = isVerticalTile ? info.position.y : info.position.x;
        const infoSizeValue = isVerticalTile ? info.size.height : info.size.width;
        const tileSizeValue = (isVerticalTile ? this.visibleTaskAreaSize.height : this.visibleTaskAreaSize.width) * 2;
        if(tileSizeValue > 0) {
            const firstTileIndex = Math.floor(infoPointValue / tileSizeValue);
            const lastTileIndex = Math.floor((infoPointValue + infoSizeValue) / tileSizeValue);
            for(let i = firstTileIndex; i <= lastTileIndex; i++) {
                if(!map[i])
                    map[i] = new Array<GridElementInfo>();
                map[i].push(info);
            }
        }
    }
    getRenderedConnectorLines(scrollPos: number): Array<GridElementInfo> {
        return this.getElementsInRenderedTiles(this.tileToDependencyMap, true, scrollPos);
    }
    getRenderedNoWorkingIntervals(scrollPos: number): Array<GridElementInfo> {
        return this.getElementsInRenderedTiles(this.tileToNoWorkingIntervalsMap, false, scrollPos);
    }
    getRenderedStripLines(settings: StripLineSettings): Array<GridElementInfo> {
        const result = new Array<GridElementInfo>();
        const stripLines = settings.stripLines.map(t => t.clone());
        if(settings.showCurrentTime)
            stripLines.push(new StripLine(new Date(), null, settings.currentTimeTitle, settings.currentTimeCssClass, true));

        for(let i: number = 0, stripLine: StripLine; stripLine = stripLines[i]; i++) {
            const start = DateUtils.parse(stripLine.start);
            const end = stripLine.end ? DateUtils.parse(stripLine.end) : null;
            if(start >= this.range.start && start <= this.range.end || (end && end >= this.range.start && end <= this.range.end)) {
                const renderedStart = start > this.range.start ? start : this.range.start;
                const info = new GridElementInfo();
                info.size.height = this.getVerticalGridLineHeight();
                info.position.x = this.getPosByDate(renderedStart);
                info.size.width = end ? this.getWidthByDateRange(renderedStart, end < this.range.end ? end : this.range.end) : 0;
                info.className = stripLine.isCurrent ? "dx-gantt-tc" : end ? "dx-gantt-ti" : "dx-gantt-tm";
                info.className += stripLine.cssClass ? " " + stripLine.cssClass : "";
                info.attr.title = stripLine.title;
                result.push(info);
            }
        }
        return result;
    }
    getElementsInRenderedTiles(map: Array<Array<GridElementInfo>>, isVerticalTile: boolean, scrollPos: number): Array<GridElementInfo> {
        const result = new Array<GridElementInfo>();
        const visibleAreaSizeValue = isVerticalTile ? this.visibleTaskAreaSize.height : this.visibleTaskAreaSize.width;
        if(visibleAreaSizeValue > 0) {
            const firstVisibleTileIndex = Math.floor(scrollPos / (visibleAreaSizeValue * 2));
            const lastVisibleTileIndex = Math.floor((scrollPos + visibleAreaSizeValue) / (visibleAreaSizeValue * 2));

            for(let i = firstVisibleTileIndex; i <= lastVisibleTileIndex; i++) {
                if(!map[i]) continue;
                map[i].forEach(info => {
                    if(result.indexOf(info) === -1)
                        result.push(info);
                });
            }
        }
        return result;
    }

    public isTaskInRenderedRange(index: number): boolean {
        const item = this.getViewItem(index);
        const point = this.getTaskPoint(index);
        if(!item.task.isMilestone())
            return point.x < this.getTotalWidth();
        else
            return point.x + this.getTaskWidth(index) < this.getTotalWidth();
    }
    public isTaskCutByRange(index: number): boolean {
        const info = this.getTaskElementInfo(index);
        return !!info.additionalInfo["taskCut"];
    }
    public checkAndCorrectElementDisplayByRange(element: HTMLElement): void {
        const side = element.parentElement.offsetLeft + element.offsetLeft + element.offsetWidth;
        if(side > this.getTotalWidth())
            element.style.display = "none";
    }
    public checkAndCorrectArrowElementDisplayByRange(element: HTMLElement): void {
        const side = element.offsetLeft + element.offsetWidth;
        if(side > this.getTotalWidth())
            element.style.display = "none";
    }
    checkAndCorrectConnectorLinesByRange(lines: Array<GridElementInfo>):void {
        if(!lines?.length) return;
        const totalWidth = this.getTotalWidth();
        for(let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isVertical = !line.size.width;
            if(line.position.x > totalWidth)
                delete lines[i];
            else if(!isVertical && line.position.x + line.size.width > totalWidth)
                line.size.width = totalWidth - line.position.x;
        }
    }
    getCorrectedTaskWidthByRange(index: number, width: number): number {
        const limitWidth = this.getTotalWidth() - this.getTaskPoint(index).x;
        return Math.min(limitWidth, width);
    }

    public static CLASSNAMES = {
        CONNECTOR_VERTICAL: "dx-gantt-conn-v",
        CONNECTOR_HORIZONTAL: "dx-gantt-conn-h"
    }
}
