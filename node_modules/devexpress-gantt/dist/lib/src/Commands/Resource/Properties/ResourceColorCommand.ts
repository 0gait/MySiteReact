import { ResourceColorHistoryItem } from "../../../Model/History/HistoryItems/Resource/Properties/ResourceColorHistoryItem";
import { ResourcePropertyCommandBase } from "./ResourcePropertyCommandBase";

export class ResourceColorCommand extends ResourcePropertyCommandBase {
    public execute(id: string, value: string): boolean {
        return super.execute(id, value);
    }
    protected executeInternal(id: string, value: string): boolean {
        const oldColor = this.control.viewModel.resources.getItemById(id).color;
        if(oldColor === value)
            return false;
        this.history.addAndRedo(new ResourceColorHistoryItem(this.modelManipulator, id, value));
        return true;
    }
}
