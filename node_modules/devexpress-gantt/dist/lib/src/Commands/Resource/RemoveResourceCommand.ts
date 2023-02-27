import { ResourceRemovingArguments } from "../../Model/Events/Resource/ResourceRemovingArguments";
import { RemoveResourceHistoryItem } from "../../Model/History/HistoryItems/Resource/RemoveResourceHistoryItem";
import { DeassignResourceHistoryItem } from "../../Model/History/HistoryItems/ResourceAssignment/DeassignResourceHistoryItem";
import { ResourceCommandBase } from "./ResourceCommandBase";

export class RemoveResourceCommand extends ResourceCommandBase {
    public execute(id: string): boolean {
        return super.execute(id);
    }
    protected executeInternal(id: string): boolean {
        const resource = this.control.viewModel.resources.items.filter(r => r.internalId === id)[0];
        if(resource) {
            const args = new ResourceRemovingArguments(resource);
            this.modelManipulator.dispatcher.notifyResourceRemoving(args);
            if(!args.cancel) {
                const removeResourceHistoryItem = new RemoveResourceHistoryItem(this.modelManipulator, id);
                const assignments = this.control.viewModel.assignments.items.filter(a => a.resourceId === id);
                assignments.forEach(a => {
                    if(this.modelManipulator.dispatcher.fireResourceUnassigning(a))
                        removeResourceHistoryItem.add(new DeassignResourceHistoryItem(this.modelManipulator, a.internalId));
                });
                this.history.addAndRedo(removeResourceHistoryItem);
                return true;
            }
        }
        return false;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowResourceDelete;
    }
}
