import { ICommand, ICommandState } from "../Interfaces/ICommand";
import { GanttView } from "../View/GanttView";
import { ModelManipulator } from "../Model/Manipulators/ModelManipulator";
import { IHistory } from "../Model/History/IHistory";
import { ValidationController } from "../Model/Validation/ValidationController";

export abstract class CommandBase<T extends ICommandState> implements ICommand {
    control: GanttView;
    private _state: ICommandState;
    get modelManipulator(): ModelManipulator { return this.control.modelManipulator; }
    get history(): IHistory { return this.control.history; }
    get validationController(): ValidationController { return this.control.validationController; }
    get state(): ICommandState {
        if(!this._state)
            this._state = this.getState();
        return this._state;
    }

    constructor(control: GanttView) {
        this.control = control;
    }
    execute(...parameters: any): boolean {
        if(!this.state.enabled)
            return false;
        const executed = this.executeInternal(...parameters);
        if(executed)
            this.control.barManager.updateItemsState([]);
        return executed;
    }
    abstract getState(): T;
    isEnabled(): boolean {
        return this.control.settings.editing.enabled;
    }
    protected executeInternal(...parameters: any): boolean { throw new Error("Not implemented"); }
}
