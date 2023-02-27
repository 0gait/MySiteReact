import { ModelManipulator } from "../../Manipulators/ModelManipulator";
import { IDataObjectKeyUpdater } from "../IInsertedKeyKeeper";

export abstract class HistoryItem {
    modelManipulator: ModelManipulator;

    constructor(modelManipulator: ModelManipulator) {
        this.setModelManipulator(modelManipulator);
    }
    public abstract redo(): void;
    public abstract undo(): void;

    public setModelManipulator(modelManipulator: ModelManipulator): void {
        this.modelManipulator = modelManipulator;
    }

    public get keyUpdaters(): IDataObjectKeyUpdater[] { return [ ]; }
}
