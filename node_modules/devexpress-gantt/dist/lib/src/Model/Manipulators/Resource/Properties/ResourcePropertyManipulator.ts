import { HistoryItemState } from "../../../History/HistoryItems/HistoryItemState";
import { Resource } from "../../../Entities/Resource";
import { BaseManipulator } from "../../BaseManipulator";

export abstract class ResourcePropertyManipulator<T> extends BaseManipulator {
    setValue(id: string, newValue: T): HistoryItemState {
        const resource = this.viewModel.resources.getItemById(id);
        const oldState = new HistoryItemState(id, this.getPropertyValue(resource));
        this.setPropertyValue(resource, newValue);
        const assignments = this.viewModel.assignments.items.filter(a => a.resourceId === resource.internalId);
        assignments.forEach(a => {
            const viewItem = this.viewModel.findItem(a.taskId);
            const index = viewItem.visibleIndex;
            this.renderHelper.recreateTaskElement(index);
        });
        return oldState;
    }
    restoreValue(state: HistoryItemState): void {
        if(!state) return;
        const stateValue = state.value;
        const resource = this.viewModel.resources.getItemById(state.id);
        this.setPropertyValue(resource, stateValue);
        const assignments = this.viewModel.assignments.items.filter(a => a.resourceId === resource.internalId);
        assignments.forEach(a => {
            const viewItem = this.viewModel.findItem(a.taskId);
            const index = viewItem.visibleIndex;
            this.renderHelper.recreateTaskElement(index);
        });
    }
    protected abstract getPropertyValue(resource: Resource): T;
    protected abstract setPropertyValue(resource: Resource, value: T): void;
}
