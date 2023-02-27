import { DeassignResourceHistoryItem } from "../../Model/History/HistoryItems/ResourceAssignment/DeassignResourceHistoryItem";
import { ResourceCommandBase } from "./ResourceCommandBase";

export class DeassignResourceCommand extends ResourceCommandBase {
    public execute(assignmentId: string): boolean {
        return super.execute(assignmentId);
    }
    protected executeInternal(assignmentId: string): boolean {
        const assignment = this.control.viewModel.assignments.items.filter(r => r.internalId === assignmentId)[0];
        if(assignment && this.modelManipulator.dispatcher.fireResourceUnassigning(assignment)) {
            this.history.addAndRedo(new DeassignResourceHistoryItem(this.modelManipulator, assignmentId));
            return true;
        }
        return false;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowTaskResourceUpdate;
    }
}
