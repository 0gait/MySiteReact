import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { HistoryItem } from "../HistoryItem";
import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { MathUtils } from "@devexpress/utils/lib/utils/math";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";

export class AssignResourceHistoryItem extends HistoryItem {
    resourceId: string;
    taskId: string;
    public insertedKey: string;

    constructor(modelManipulator: ModelManipulator, resourceId: string, taskId: string) {
        super(modelManipulator);
        this.resourceId = resourceId;
        this.taskId = taskId;
    }
    public redo(): void {
        this.insertedKey ??= MathUtils.generateGuid();
        this.modelManipulator.resource.assign(this.resourceId, this.taskId, this.insertedKey);
    }
    public undo(): void {
        this.modelManipulator.resource.deassig(this.insertedKey);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.resourceAssignment,
                getKey: () => this.insertedKey,
                updateKey: value => this.insertedKey = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.taskId,
                updateKey: value => this.taskId = value
            },
            {
                objectType: GanttDataObjectNames.resource,
                getKey: () => this.resourceId,
                updateKey: value => this.resourceId = value
            }
        ];
    }
}
