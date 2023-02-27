import { Point } from "@devexpress/utils/lib/geometry/point";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { KeyCode, ModifierKey } from "@devexpress/utils/lib/utils/key";
import { TaskEditController } from "../Edit/TaskEditController";
import { GanttView } from "../GanttView";
import { RenderHelper } from "../Render/RenderHelper";
import { GanttMovingHelper } from "./MovingHelper";
import { TaskAreaStateEventNames } from "./States/TaskAreaStateEventNames";
import { TaskAreaEventArgs } from "./TaskAreaEventArgs";

export type TaskAreaEventHandler = (args: TaskAreaEventArgs) => any | void;

export interface ITaskAreaEventsListener {
    getHandler(eventKey: string): TaskAreaEventHandler;
    setHandler(eventKey: string, handler: TaskAreaEventHandler): void;
}

export class TaskAreaEventsListener implements ITaskAreaEventsListener {
    private _owner: GanttView;
    constructor(owner: GanttView) {
        this._owner = owner;
    }

    protected get taskEditController(): TaskEditController {
        return this._owner?.taskEditController;
    }
    protected get renderHelper(): RenderHelper {
        return this._owner?.renderHelper;
    }

    public getHandler(eventKey: string): TaskAreaEventHandler {
        return this.handlers[eventKey];
    }
    public setHandler(eventKey: string, handler: TaskAreaEventHandler): void {
        this.handlers[eventKey] = handler;
    }
    private _handlers: Record<string, TaskAreaEventHandler>;
    protected get handlers(): Record<string, TaskAreaEventHandler> {
        this._handlers ??= this.createTaskAreaEventHandlers();
        return this._handlers;
    }
    protected createTaskAreaEventHandlers(): Record<string, TaskAreaEventHandler> {
        const handlers = { };
        handlers[TaskAreaStateEventNames.TASK_AREA_CLICK] = this.taskAreaClickHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_DBLCLICK] = this.taskAreaDblClickHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_SCROLL] = this.taskAreaScrollHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_START_MOVE] = this.taskAreaStartMoveHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_PROCESS_MOVE] = this.taskAreaProcessMoveHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_END_MOVE] = this.taskAreaEndMoveHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_ZOOM_IN] = this.taskAreaZoomInHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_ZOOM_OUT] = this.taskAreaZoomOutHandler.bind(this);
        handlers[TaskAreaStateEventNames.CONTEXTMENU_SHOW] = this.taskAreaContextMenuShowHandler.bind(this);
        handlers[TaskAreaStateEventNames.CONTEXTMENU_HIDE] = this.taskAreaContextMenuHideHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_SELECTION] = this.taskSelectionHandler.bind(this);
        handlers[TaskAreaStateEventNames.DEPENDENCY_SELECTION] = this.dependencySelectionHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_EDIT_START] = this.taskEditStartHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_EDIT_END] = this.taskEditEndHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_LEAVE] = this.taskLeaveHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_PROCESS_MOVE] = this.taskProcessMoveHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_END_MOVE] = this.taskEndMoveHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_PROCESS_PROGRESS] = this.taskProcessProgressHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_END_PROGRESS] = this.taskEndProgressHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_PROCESS_START] = this.taskProcessStartHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_CONFIRM_START] = this.taskConfirmStartHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_PROCESS_END] = this.taskProcessEndHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_CONFIRM_END] = this.taskConfirmEndHandler.bind(this);
        handlers[TaskAreaStateEventNames.GET_DEPENDENCY_POINTS] = this.getDependencyPoints.bind(this);
        handlers[TaskAreaStateEventNames.DEPENDENCY_START] = this.dependencyStartHandler.bind(this);
        handlers[TaskAreaStateEventNames.DEPENDENCY_END] = this.dependencyEndHandler.bind(this);
        handlers[TaskAreaStateEventNames.DEPENDENCY_PROCESS] = this.dependencyProcessHandler.bind(this);
        handlers[TaskAreaStateEventNames.TASK_AREA_KEY_DOWN] = this.onTaskAreaKeyDown.bind(this);
        handlers[TaskAreaStateEventNames.GET_COORDINATES_REF_POINT] = this.getCoordinatesRefPoint.bind(this);
        handlers[TaskAreaStateEventNames.STATE_EXIT] = () => { };
        return handlers;
    }
    protected taskAreaClickHandler(args: TaskAreaEventArgs): boolean {
        return this._owner.onTaskAreaClick(args.rowIndex, args.triggerEvent);
    }
    protected taskAreaDblClickHandler(args: TaskAreaEventArgs): void {
        this._owner.onTaskAreaDblClick(args.rowIndex, args.triggerEvent);
    }
    protected taskSelectionHandler(args: TaskAreaEventArgs): void {
        this._owner.onTaskSelectionChanged(args.rowIndex, args.triggerEvent);
    }
    protected taskAreaContextMenuShowHandler(args: TaskAreaEventArgs): void {
        this._owner.onTaskAreaContextMenu(args.rowIndex, args.triggerEvent, args.info["type"]);
    }
    protected taskAreaContextMenuHideHandler(): void {
        this._owner.hidePopupMenu();
    }
    protected taskAreaScrollHandler(args: TaskAreaEventArgs): void {
        this._owner.updateView();
    }
    protected dependencySelectionHandler(args: TaskAreaEventArgs): void {
        const key = args.info["key"];
        const currentSelectedKey = this.taskEditController.dependencyId;
        const needChangeSelection = key !== currentSelectedKey || (!key && isDefined(currentSelectedKey));
        if(needChangeSelection)
            this._owner.selectDependency(key);
    }

    private _ganttMovingHelper: GanttMovingHelper;
    private get ganttMovingHelper(): GanttMovingHelper {
        this._ganttMovingHelper ??= new GanttMovingHelper(this._owner.renderHelper.taskAreaContainer);
        return this._ganttMovingHelper;
    }

    protected taskAreaStartMoveHandler(args: TaskAreaEventArgs): void {
        this.ganttMovingHelper.startMoving(args.triggerEvent);
    }
    protected taskAreaProcessMoveHandler(args: TaskAreaEventArgs): void {
        if(this.ganttMovingHelper.movingInfo) {
            this.ganttMovingHelper.onMouseMove(args.triggerEvent);
            args.triggerEvent.preventDefault();
        }
    }
    protected taskAreaEndMoveHandler(args: TaskAreaEventArgs): void {
        this.ganttMovingHelper.onMouseUp(args.triggerEvent);
    }
    protected taskAreaZoomInHandler(args: TaskAreaEventArgs): void {
        this._owner.zoomIn(args.info["leftPos"]);
    }
    protected taskAreaZoomOutHandler(args: TaskAreaEventArgs): void {
        this._owner.zoomOut(args.info["leftPos"]);
    }
    protected getCoordinatesRefPoint(args: TaskAreaEventArgs): Point {
        const x = DomUtils.getAbsolutePositionX(this.renderHelper.taskAreaContainer.getElement());
        const y = DomUtils.getAbsolutePositionY(this.renderHelper.taskAreaContainer.getElement());
        return new Point(x, y);
    }
    private taskEditStartHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.show(args.rowIndex);
        this.taskEditController.showTaskInfo(EvtUtils.getEventX(args.triggerEvent as MouseEvent | TouchEvent));
    }
    private taskLeaveHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.cancel();
    }
    private taskEditEndHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.endEditing();
    }
    private taskEndMoveHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.confirmMove();
    }
    private taskProcessMoveHandler(args: TaskAreaEventArgs): boolean {
        return this.taskEditController.processMove(args.info["delta"] ?? 0);
    }
    private taskEndProgressHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.confirmProgress();
    }
    private taskProcessProgressHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.processProgress(args.info["position"]);
    }
    private taskProcessStartHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.processStart(args.info["position"]);
    }
    private taskConfirmStartHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.confirmStart();
    }
    private taskProcessEndHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.processEnd(args.info["position"]);
    }
    private taskConfirmEndHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.confirmEnd();
    }
    private getDependencyPoints(args: TaskAreaEventArgs): Record<string, Point> {
        const info = { };
        info["successorStart"] = new Point(
            DomUtils.getAbsolutePositionX(this.taskEditController.dependencySuccessorStart) + this.taskEditController.dependencySuccessorStart.clientWidth / 2,
            DomUtils.getAbsolutePositionY(this.taskEditController.dependencySuccessorStart) + this.taskEditController.dependencySuccessorStart.clientHeight / 2);
        info["successorFinish"] = new Point(
            DomUtils.getAbsolutePositionX(this.taskEditController.dependencySuccessorFinish) + this.taskEditController.dependencySuccessorFinish.clientWidth / 2,
            DomUtils.getAbsolutePositionY(this.taskEditController.dependencySuccessorFinish) + this.taskEditController.dependencySuccessorFinish.clientHeight / 2);
        return info;
    }
    private dependencyStartHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.startDependency(args.info["pos"]);
    }
    private dependencyEndHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.endDependency(args.info["type"]);
    }
    private dependencyProcessHandler(args: TaskAreaEventArgs): void {
        this.taskEditController.processDependency(args.info["pos"]);
        if(this._owner.viewModel.tasks.items[args.rowIndex])
            this.taskEditController.showDependencySuccessor(args.rowIndex);
    }
    private onTaskAreaKeyDown(args: TaskAreaEventArgs): void {
        const code = args.info["code"];
        if(code == (ModifierKey.Ctrl | KeyCode.Key_z))
            this._owner.history.undo();
        if(code == (ModifierKey.Ctrl | KeyCode.Key_y))
            this._owner.history.redo();
        if(code == KeyCode.Delete)
            this.taskEditController.deleteSelectedDependency();
    }
}
