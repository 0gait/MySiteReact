import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { Dependency } from "../../../Entities/Dependency";
import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { HistoryItem } from "../HistoryItem";

export class RemoveDependencyHistoryItem extends HistoryItem {
    dependencyId: string;
    dependency: Dependency;

    constructor(modelManipulator: ModelManipulator, dependencyId: string) {
        super(modelManipulator);
        this.dependencyId = dependencyId;
    }
    public redo(): void {
        this.dependency = this.modelManipulator.dependency.removeDependency(this.dependencyId);
    }
    public undo(): void {
        this.modelManipulator.dependency.insertDependency(this.dependency.predecessorId, this.dependency.successorId, this.dependency.type, this.dependencyId);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.dependency,
                getKey: () => this.dependencyId,
                updateKey: value => this.dependencyId = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.dependency?.predecessorId,
                updateKey: value => this.dependency.predecessorId = value
            },
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.dependency?.successorId,
                updateKey: value => this.dependency.successorId = value
            }
        ];
    }
}
