import { GanttDataObjectNames } from "../../../../Entities/DataObject";
import { ModelManipulator } from "../../../../Manipulators/ModelManipulator";
import { ResourcePropertyManipulator } from "../../../../Manipulators/Resource/Properties/ResourcePropertyManipulator";
import { IDataObjectKeyUpdater } from "../../../IInsertedKeyKeeper";
import { HistoryItem } from "../../HistoryItem";
import { HistoryItemState } from "../../HistoryItemState";

export class ResourcePropertiesHistoryItemBase<T> extends HistoryItem {
    oldState: HistoryItemState;
    resourceId: string;
    newValue: T;

    constructor(modelManipulator: ModelManipulator, resourceId: string, newValue: T) {
        super(modelManipulator);
        this.resourceId = resourceId;
        this.newValue = newValue;
    }
    public redo(): void {
        this.oldState = this.getPropertiesManipulator().setValue(this.resourceId, this.newValue);
    }
    public undo(): void {
        this.getPropertiesManipulator().restoreValue(this.oldState);
    }
    protected getPropertiesManipulator(): ResourcePropertyManipulator<T> {
        throw new Error("Not Implemented");
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.resource,
                getKey: () => this.resourceId,
                updateKey: value => this.resourceId = value
            }
        ];
    }
}
