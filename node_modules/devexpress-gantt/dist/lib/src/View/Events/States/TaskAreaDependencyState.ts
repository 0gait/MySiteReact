import { Point } from "@devexpress/utils/lib/geometry/point";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { DependencyType } from "../../../Model/Entities/Enums";
import { TaskAreaEventSource } from "../../Helpers/Enums";
import { TaskAreaDomHelper } from "./TaskAreaDomHelper";
import { TaskAreaStateBase } from "./TaskAreaStateBase";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";

export const dependencyMap = [];

dependencyMap[TaskAreaEventSource.TaskEdit_DependencyStart] = [];
dependencyMap[TaskAreaEventSource.TaskEdit_DependencyFinish] = [];
dependencyMap[TaskAreaEventSource.TaskEdit_DependencyStart][TaskAreaEventSource.Successor_DependencyStart] = DependencyType.SS;
dependencyMap[TaskAreaEventSource.TaskEdit_DependencyStart][TaskAreaEventSource.Successor_DependencyFinish] = DependencyType.SF;
dependencyMap[TaskAreaEventSource.TaskEdit_DependencyFinish][TaskAreaEventSource.Successor_DependencyStart] = DependencyType.FS;
dependencyMap[TaskAreaEventSource.TaskEdit_DependencyFinish][TaskAreaEventSource.Successor_DependencyFinish] = DependencyType.FF;

export class TaskAreaDependencyState extends TaskAreaStateBase {
    source: TaskAreaEventSource;

    public onMouseUp(evt: MouseEvent): void { this.onDependencyEndByMouse(evt); }
    protected onMouseDownInternal(evt: MouseEvent): void { this.onDependencyStart(evt); }
    protected onMouseMoveInternal(evt: MouseEvent): void { this.onDependencyMoveStep(evt); }

    protected onTouchStartInternal(evt: TouchEvent): void { this.onDependencyStart(evt); }
    protected onTouchEndInternal(evt: TouchEvent): void { this.onDependencyEndByTouch(evt); }
    protected onTouchMoveInternal(evt: TouchEvent): void { this.onDependencyMoveStep(evt); }

    protected onDocumentPointerDownInternal(evt: PointerEvent): void { this.onDependencyStart(evt); }
    protected onDocumentPointerUpInternal(evt: PointerEvent): void { this.onDependencyEndByTouch(evt); }
    protected onDocumentPointerMoveInternal(evt: PointerEvent): void { this.onDependencyMoveStep(evt); }


    private onDependencyStart(evt: MouseEvent | TouchEvent): void {
        const sourceElement = EvtUtils.getEventSource(evt);
        this.source = TaskAreaDomHelper.getEventSource(sourceElement);
        const pos = this.getRelativePos(new Point(
            DomUtils.getAbsolutePositionX(sourceElement) + sourceElement.clientWidth / 2,
            DomUtils.getAbsolutePositionY(sourceElement) + sourceElement.clientHeight / 2));
        this.raiseEvent(TaskAreaStateEventNames.DEPENDENCY_START, evt, null, { pos: pos });
    }
    private onDependencyMoveStep(evt: MouseEvent | TouchEvent): void {
        evt.preventDefault();
        const relativePos = this.getRelativePos(new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt)));
        this.raiseEvent(TaskAreaStateEventNames.DEPENDENCY_PROCESS, evt, this.getClickedRowIndex(evt), { pos: relativePos });
    }
    private onDependencyEndByMouse(evt: MouseEvent): void {
        const target = TaskAreaDomHelper.getEventSource(EvtUtils.getEventSource(evt));
        const type = target === TaskAreaEventSource.Successor_DependencyStart || target === TaskAreaEventSource.Successor_DependencyFinish ?
            dependencyMap[this.source][target] : null;
        this.processEndDependency(evt, type);
    }
    private onDependencyEndByTouch(evt: TouchEvent | PointerEvent): void {
        const dependencyPoints = this.raiseEvent(TaskAreaStateEventNames.GET_DEPENDENCY_POINTS, evt);
        const relativePosStart = this.getRelativePos(dependencyPoints["successorStart"]);
        const relativePosEnd = this.getRelativePos(dependencyPoints["successorFinish"]);
        const relativeTouchPos = this.getRelativePos(new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt)));
        const target = this.isTouchNearby(relativeTouchPos, relativePosStart) ? TaskAreaEventSource.Successor_DependencyStart :
            this.isTouchNearby(relativeTouchPos, relativePosEnd) ? TaskAreaEventSource.Successor_DependencyFinish : null;
        const type = target === TaskAreaEventSource.Successor_DependencyStart || target === TaskAreaEventSource.Successor_DependencyFinish ?
            dependencyMap[this.source][target] : null;
        this.processEndDependency(evt, type);
    }
    protected onTaskAreaLeaveInternal(evt: MouseEvent): void {
        this.processEndDependency(evt, null);
    }
    private processEndDependency(evt: MouseEvent | TouchEvent, type: DependencyType): void {
        this.raiseEvent(TaskAreaStateEventNames.DEPENDENCY_END, evt, null, { type: type });
        this.raiseEvent(TaskAreaStateEventNames.STATE_EXIT, evt);
    }
    private isTouchNearby(touchPos: Point, elementPos: Point) {
        if(Math.abs(elementPos.x - touchPos.x) <= 20 && Math.abs(elementPos.y - touchPos.y) <= 20)
            return true;
        return false;
    }
}
