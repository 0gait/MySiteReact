import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { Task } from "../../../Entities/Task";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { CompositionHistoryItem } from "../CompositionHistoryItem";
import { HistoryItem } from "../HistoryItem";

export class RemoveTaskHistoryItem extends CompositionHistoryItem {
    taskId: string;
    task: Task;

    constructor(modelManipulator: ModelManipulator, taskId: string) {
        super();
        this.modelManipulator = modelManipulator;
        this.taskId = taskId;
    }
    public redo(): void {
        super.redo();
        this.task = this.modelManipulator.task.remove(this.taskId);
    }

    public undo(): void {
        this.modelManipulator.task.create(this.task, this.taskId, () => {
            window.setTimeout(() => super.undo(), 0);
        });
    }
    public undoItemsQuery(): void {
        this.modelManipulator.task.create(this.task, this.taskId);
        let item: HistoryItem;
        for(let i = this.historyItems.length - 1; item = this.historyItems[i]; i--)
            if(item instanceof CompositionHistoryItem)
                item.undoItemsQuery();
            else
                item.undo();
    }
    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.taskId,
                updateKey: value => this.taskId = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.task?.parentId,
                updateKey: value => this.task.parentId = value
            }
        ];
    }
}
