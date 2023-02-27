import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class TaskCommandBase extends CommandBase<SimpleCommandState> {
    protected isApiCall: boolean = false;
    public getState(): SimpleCommandState {
        const state = new SimpleCommandState(this.isEnabled());
        state.visible = this.control.settings.editing.enabled && !this.control.taskEditController.dependencyId;
        return state;
    }
    updateParent(parent: ViewVisualModelItem): void {
        const isAutoUpdateParentTask = this.validationController._parentAutoCalc;
        if(isAutoUpdateParentTask && parent && parent.children.length > 0)
            this.control.validationController.updateParentsIfRequired(parent.children[0].task.internalId);

    }
}
