import { ConfirmationType } from "../../Dialogs/DialogEnums";
import { ConfirmationDialogParameters } from "../../Dialogs/DialogParameters/ConfirmationDialogParameters";
import { DependencyRemovingArguments } from "../../Model/Events/Dependency/DependencyRemovingArguments";
import { RemoveDependencyHistoryItem } from "../../Model/History/HistoryItems/Dependency/RemoveDependencyHistoryItem";
import { SimpleCommandState } from "../SimpleCommandState";
import { DependencyCommandBase } from "./DependencyCommandBase";

export class RemoveDependencyCommand extends DependencyCommandBase {
    public execute(id: string, confirmRequired: boolean = true): boolean {
        if(confirmRequired) {
            this.control.commandManager.showConfirmationDialog.execute(
                new ConfirmationDialogParameters(ConfirmationType.DependencyDelete,
                    () => { this.executeInternal(id); }));
            return false;
        }

        return super.execute(id);
    }
    protected executeInternal(id: string): boolean {
        id = id || this.control.taskEditController.dependencyId;
        if(id != null) {
            const dependency = this.control.viewModel.dependencies.items.filter(d => d.internalId === id)[0];
            if(dependency) {
                const args = new DependencyRemovingArguments(dependency);
                this.modelManipulator.dispatcher.notifyDependencyRemoving(args);
                if(!args.cancel) {
                    this.history.addAndRedo(new RemoveDependencyHistoryItem(this.modelManipulator, id));
                    if(id === this.control.taskEditController.dependencyId)
                        this.control.taskEditController.selectDependency(null);
                    this.control.barManager.updateItemsState([]);
                    return true;
                }
            }
        }
        return false;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowDependencyDelete;
    }
    public getState(): SimpleCommandState {
        const state = super.getState();
        state.visible = state.enabled && this.control.taskEditController.dependencyId != null;
        return state;
    }
}
