import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { ResourceAssignment } from "../../../Entities/ResourceAssignment";
import { HistoryItem } from "../HistoryItem";
import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";

export class DeassignResourceHistoryItem extends HistoryItem {
    assignmentId: string;
    assignment: ResourceAssignment;

    constructor(modelManipulator: ModelManipulator, assignmentId: string) {
        super(modelManipulator);
        this.assignmentId = assignmentId;
    }
    public redo(): void {
        this.assignment = this.modelManipulator.resource.deassig(this.assignmentId);
    }
    public undo(): void {
        this.modelManipulator.resource.assign(this.assignment.resourceId, this.assignment.taskId, this.assignmentId);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.resourceAssignment,
                getKey: () => this.assignmentId,
                updateKey: value => this.assignmentId = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.assignment?.taskId,
                updateKey: value => this.assignment.taskId = value
            },
            {
                objectType: GanttDataObjectNames.resource,
                getKey: () => this.assignment?.resourceId,
                updateKey: value => this.assignment.resourceId = value
            }
        ];
    }
}
