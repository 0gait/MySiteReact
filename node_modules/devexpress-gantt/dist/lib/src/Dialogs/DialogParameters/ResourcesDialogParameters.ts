import { ResourceCollection } from "../../Model/Collections/ResourceCollection";
import { DialogParametersBase } from "./DialogParametersBase";

export class ResourcesDialogParameters extends DialogParametersBase {
    resources: ResourceCollection;
    clone(): ResourcesDialogParameters {
        const clone = new ResourcesDialogParameters();
        clone.resources = new ResourceCollection();
        clone.resources.addRange(this.resources.items);
        return clone;
    }
}
