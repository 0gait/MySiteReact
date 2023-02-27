import { Point } from "@devexpress/utils/lib/geometry/point";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { TaskAreaEventSource } from "../../Helpers/Enums";
import { TaskAreaDomHelper } from "./TaskAreaDomHelper";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";
import { TaskDragBaseState } from "./TaskDragBaseState";

export class TaskEditState extends TaskDragBaseState {
    private _source: TaskAreaEventSource;
    protected onStartInternal(evt: MouseEvent | TouchEvent): void {
        this._source ??= TaskAreaDomHelper.getEventSource(EvtUtils.getEventSource(evt));
    }
    protected onEndInternal(_evt: MouseEvent | TouchEvent): void { this.raiseEvent(this.getEventOnEndKey(), _evt); }
    protected onDragInternal(position: Point): void {
        const relativePosition = this.getRelativePos(position);
        this.raiseEvent(this.getEventOnDragKey(), null, null, { position: relativePosition });
    }
    private getEventOnDragKey(): string {
        switch(this._source) {
            case TaskAreaEventSource.TaskEdit_Start:
                return TaskAreaStateEventNames.TASK_PROCESS_START;
                break;
            case TaskAreaEventSource.TaskEdit_End:
                return TaskAreaStateEventNames.TASK_PROCESS_END;
                break;
            case TaskAreaEventSource.TaskEdit_Progress:
                return TaskAreaStateEventNames.TASK_PROCESS_PROGRESS;
                break;
        }
    }
    private getEventOnEndKey(): string {
        switch(this._source) {
            case TaskAreaEventSource.TaskEdit_Start:
                return TaskAreaStateEventNames.TASK_CONFIRM_START;
                break;
            case TaskAreaEventSource.TaskEdit_End:
                return TaskAreaStateEventNames.TASK_CONFIRM_END;
                break;
            case TaskAreaEventSource.TaskEdit_Progress:
                return TaskAreaStateEventNames.TASK_END_PROGRESS;
                break;
        }
    }
}
