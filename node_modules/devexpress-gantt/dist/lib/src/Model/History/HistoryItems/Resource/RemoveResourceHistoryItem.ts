import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { Resource } from "../../../Entities/Resource";
import { CompositionHistoryItem } from "../CompositionHistoryItem";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { GanttDataObjectNames } from "../../../Entities/DataObject";

export class RemoveResourceHistoryItem extends CompositionHistoryItem {
    resourceId: string;
    resource: Resource;
    modelManipulator: ModelManipulator;

    constructor(modelManipulator: ModelManipulator, resourceId: string) {
        super();
        this.modelManipulator = modelManipulator;
        this.resourceId = resourceId;
    }
    public redo(): void {
        super.redo();
        this.resource = this.modelManipulator.resource.remove(this.resourceId);
    }
    public undo(): void {
        this.modelManipulator.resource.create(this.resource.text, this.resource.color, this.resourceId, () => {
            if(this.resource.color)
                this.modelManipulator.resource.properties.color.setValue(this.resource.internalId, this.resource.color);
            window.setTimeout(() => super.undo(), 0);
        });
    }
    public undoItemsQuery(): void {
        this.modelManipulator.resource.create(this.resource.text, this.resource.color, this.resourceId, () => { });
        if(this.resource.color)
            this.modelManipulator.resource.properties.color.setValue(this.resource.internalId, this.resource.color);
        super.undo();
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
