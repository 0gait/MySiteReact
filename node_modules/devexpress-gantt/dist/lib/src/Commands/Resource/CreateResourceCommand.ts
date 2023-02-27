import { ResourceInsertingArguments } from "../../Model/Events/Resource/ResourceInsertingArguments";
import { CreateResourceHistoryItem } from "../../Model/History/HistoryItems/Resource/CreateResourceHistoryItem";
import { ResourceCommandBase } from "./ResourceCommandBase";

export class CreateResourceCommand extends ResourceCommandBase {
    public execute(text: string, color: string = "", callback?: (id: any) => void): boolean {
        return super.execute(text, color, callback);
    }
    protected executeInternal(text: string, color: string = "", callback?: (id: any) => void): boolean {
        const args = new ResourceInsertingArguments(text, color);
        this.modelManipulator.dispatcher.notifyResourceCreating(args);
        if(!args.cancel)
            this.history.addAndRedo(new CreateResourceHistoryItem(this.modelManipulator, args.text, args.color, callback));
        return !args.cancel;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowResourceInsert;
    }
}
