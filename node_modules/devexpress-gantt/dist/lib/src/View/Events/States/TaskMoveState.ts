import { Point } from "@devexpress/utils/lib/geometry/point";
import { TaskAreaStateEventNames } from "./TaskAreaStateEventNames";
import { TaskDragBaseState } from "./TaskDragBaseState";

export class TaskMoveState extends TaskDragBaseState {
    protected onEndInternal(_evt: MouseEvent | TouchEvent): void {
        this.raiseEvent(TaskAreaStateEventNames.TASK_END_MOVE, _evt);
    }
    protected onDragInternal(position: Point): void {
        if(!this.raiseEvent(TaskAreaStateEventNames.TASK_PROCESS_MOVE, null, null, { delta: position.x - this.currentPosition.x }))
            this.raiseEvent(TaskAreaStateEventNames.STATE_EXIT);
    }
}
