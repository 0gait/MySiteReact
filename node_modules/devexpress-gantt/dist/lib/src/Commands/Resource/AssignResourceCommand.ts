import { ResourceAssigningArguments } from "../../Model/Events/ResourceAssignment/ResourceAssigningArguments";
import { AssignResourceHistoryItem } from "../../Model/History/HistoryItems/ResourceAssignment/AssignResourceHistoryItem";
import { ResourceCommandBase } from "./ResourceCommandBase";

export class AssignResourceCommand extends ResourceCommandBase {
    public execute(resourceId: string, taskId: string): boolean {
        return super.execute(resourceId, taskId);
    }
    protected executeInternal(resourceId: string, taskId: string): boolean {
        const assignment = this.control.viewModel.assignments.items.filter(r => r.resourceId === resourceId && r.taskId === taskId)[0];
        if(!assignment) {
            const converter = this.control.viewModel;
            const args = new ResourceAssigningArguments(
                converter.convertInternalToPublicKey("resource", resourceId),
                converter.convertInternalToPublicKey("task", taskId)
            );
            this.modelManipulator.dispatcher.notifyResourceAssigning(args);
            if(!args.cancel) {
                this.history.addAndRedo(new AssignResourceHistoryItem(
                    this.modelManipulator,
                    converter.convertPublicToInternalKey("resource", args.resourceId),
                    converter.convertPublicToInternalKey("task", args.taskId)
                ));
                return true;
            }
        }
        return false;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowTaskResourceUpdate;
    }
}
