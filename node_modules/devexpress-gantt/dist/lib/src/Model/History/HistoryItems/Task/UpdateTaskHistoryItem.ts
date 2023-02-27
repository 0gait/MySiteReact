import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { ITaskUpdateValues } from "../../../Entities/ITaskUpdateValues";
import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { HistoryItem } from "../HistoryItem";
import { HistoryItemState } from "../HistoryItemState";

export class UpdateTaskHistoryItem extends HistoryItem {

    oldState: HistoryItemState;
    taskId: string;
    newValues: ITaskUpdateValues;

    constructor(modelManipulator: ModelManipulator, taskId: string, newValues: ITaskUpdateValues) {
        super(modelManipulator);
        this.taskId = taskId;
        this.newValues = newValues;
    }
    public redo(): void {
        const oldTaskState = this.modelManipulator.task.update(this.taskId, this.newValues);
        this.oldState = new HistoryItemState(this.taskId, oldTaskState);
    }
    public undo(): void {
        this.modelManipulator.task.update(this.taskId, this.oldState.value);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.taskId,
                updateKey: value => this.taskId = value
            }
        ];
    }

}
