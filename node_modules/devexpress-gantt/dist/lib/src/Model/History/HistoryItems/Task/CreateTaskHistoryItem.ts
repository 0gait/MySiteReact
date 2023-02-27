import { MathUtils } from "@devexpress/utils/lib/utils/math";
import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { HistoryItem } from "../HistoryItem";

export class CreateTaskHistoryItem extends HistoryItem {
    data: Record<string, any>

    public insertedKey: string;

    constructor(modelManipulator: ModelManipulator, data: Record<string, any>) {
        super(modelManipulator);
        this.data = data;
    }
    public redo(): void {
        this.insertedKey ??= MathUtils.generateGuid();
        this.modelManipulator.task.create(this.data, this.insertedKey);
    }
    public undo(): void {
        this.modelManipulator.task.remove(this.insertedKey);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        const result = [
            {
                objectType: GanttDataObjectNames.task,
                getKey: () => this.insertedKey,
                updateKey: value => this.insertedKey = value
            }
        ];
        if(this.data?.parentId)
            result.push({
                objectType: GanttDataObjectNames.task,
                getKey: () => this.data?.parentId,
                updateKey: value => this.data.parentId = value
            });

        return result;
    }
}
