import { MathUtils } from "@devexpress/utils/lib/utils/math";
import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { DependencyType } from "../../../Entities/Enums";
import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { HistoryItem } from "../HistoryItem";

export class InsertDependencyHistoryItem extends HistoryItem {
    predecessorId: string;
    successorId: string;
    type: DependencyType;

    public insertedKey: string;


    constructor(modelManipulator: ModelManipulator, predecessorId: string, successorId: string, type: DependencyType) {
        super(modelManipulator);
        this.predecessorId = predecessorId;
        this.successorId = successorId;
        this.type = type;
    }
    public redo(): void {
        this.insertedKey ??= MathUtils.generateGuid();
        this.modelManipulator.dependency.insertDependency(this.predecessorId, this.successorId, this.type, this.insertedKey);
    }
    public undo(): void {
        this.modelManipulator.dependency.removeDependency(this.insertedKey);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.dependency,
                getKey: () => this.insertedKey,
                updateKey: value => this.insertedKey = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.predecessorId,
                updateKey: value => this.predecessorId = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.successorId,
                updateKey: value => this.successorId = value
            }
        ];
    }
}

