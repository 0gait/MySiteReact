import { ResourceCollection } from "../Model/Collections/ResourceCollection";
import { ResourceManagerDialogShowingArguments } from "../Model/Events/Dialogs/ResourceManagerDialogShowingArguments";
import { DialogBase } from "./DialogBase";
import { ConfirmationType } from "./DialogEnums";
import { ConfirmationDialogParameters } from "./DialogParameters/ConfirmationDialogParameters";
import { ResourcesDialogParameters } from "./DialogParameters/ResourcesDialogParameters";

export class ResourcesDialogCommand extends DialogBase<ResourcesDialogParameters> {
    resourcesForDelete = [];

    callBack: () => void;

    onBeforeDialogShow(params: ResourcesDialogParameters): boolean {
        return this.modelManipulator.dispatcher.raiseResourceManagerDialogShowing(
            params,
            (args: ResourceManagerDialogShowingArguments) => {
                params.resources = args.values.resources;
            }
        );
    }
    applyParameters(newParameters: ResourcesDialogParameters, oldParameters: ResourcesDialogParameters): boolean {
        this.history.beginTransaction();
        for(let i = 0; i < newParameters.resources.length; i++) {
            const resource = oldParameters.resources.getItemById(newParameters.resources.getItem(i).internalId);
            if(!resource)
                this.control.commandManager.createResourceCommand.execute(newParameters.resources.getItem(i).text);
        }
        for(let i = 0; i < oldParameters.resources.length; i++) {
            const resource = newParameters.resources.getItemById(oldParameters.resources.getItem(i).internalId);
            if(!resource)
                this.resourcesForDelete.push(oldParameters.resources.getItem(i));
        }
        this.history.endTransaction();
        return false;
    }
    createParameters(callBack: () => void): ResourcesDialogParameters {
        this.callBack = callBack;
        const param = new ResourcesDialogParameters();
        param.resources = new ResourceCollection();
        param.resources.addRange(this.control.viewModel.resources.items);
        return param;
    }
    afterClosing(): void {
        if(this.resourcesForDelete.length) {
            const confirmationDialog = this.control.commandManager.showConfirmationDialog;
            const confirmationDialogParameters = new ConfirmationDialogParameters(ConfirmationType.ResourcesDelete,
                () => {
                    this.history.beginTransaction();
                    for(let i = 0; i < this.resourcesForDelete.length; i++)
                        this.control.commandManager.removeResourceCommand.execute(this.resourcesForDelete[i].internalId);
                    this.history.endTransaction();
                });
            confirmationDialogParameters.message = this.resourcesForDelete.reduce(function(a, b) { return [...a, b.text]; }, []).join(", ");
            if(this.callBack)
                confirmationDialog.afterClosing = () => {
                    delete DialogBase.activeInstance;
                    this.callBack();
                };
            confirmationDialog.execute(confirmationDialogParameters);
        }
        else if(this.callBack)
            this.callBack();
    }
    getDialogName(): string {
        return "Resources";
    }
}

