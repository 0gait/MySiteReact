import { ResourcesDialogParameters } from "../../../Dialogs/DialogParameters/ResourcesDialogParameters";
import { BaseArguments } from "../BaseArguments";

export class ResourceManagerDialogShowingArguments extends BaseArguments {
    constructor(params: ResourcesDialogParameters) {
        super(undefined);
        this.values.resources = params.resources;
    }
}
