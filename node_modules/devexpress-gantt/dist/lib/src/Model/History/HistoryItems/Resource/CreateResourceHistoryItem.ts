import { ModelManipulator } from "../../../Manipulators/ModelManipulator";
import { HistoryItem } from "../HistoryItem";
import { IDataObjectKeyUpdater } from "../../IInsertedKeyKeeper";
import { GanttDataObjectNames } from "../../../Entities/DataObject";
import { MathUtils } from "@devexpress/utils/lib/utils/math";

export class CreateResourceHistoryItem extends HistoryItem {
    text: string;
    color: string;
    createCallback: (id: any) => void;
    public insertedKey: string;

    constructor(modelManipulator: ModelManipulator, text: string, color: string = "", callback?: (id: any) => void) {
        super(modelManipulator);
        this.text = text;
        this.color = color;
        this.createCallback = callback;
    }
    public redo(): void {
        this.insertedKey ??= MathUtils.generateGuid();
        this.modelManipulator.resource.create(this.text, this.color, this.insertedKey, this.createCallback);
    }
    public undo(): void {
        this.modelManipulator.resource.remove(this.insertedKey);
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] {
        return [
            {
                objectType: GanttDataObjectNames.resource,
                getKey: () => this.insertedKey,
                updateKey: value => this.insertedKey = value
            }
        ];
    }
}
