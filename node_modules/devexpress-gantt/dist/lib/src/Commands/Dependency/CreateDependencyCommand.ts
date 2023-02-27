import { DependencyType } from "../../Model/Entities/Enums";
import { DependencyInsertingArguments } from "../../Model/Events/Dependency/DependencyInsertingArguments";
import { InsertDependencyHistoryItem } from "../../Model/History/HistoryItems/Dependency/InsertDependencyHistoryItem";
import { DependencyCommandBase } from "./DependencyCommandBase";

export class CreateDependencyCommand extends DependencyCommandBase {
    public execute(predecessorId: string, successorId: string, type: DependencyType): boolean {
        return super.execute(predecessorId, successorId, type);
    }
    protected executeInternal(predecessorId: string, successorId: string, type: DependencyType): boolean {
        if(this.control.viewModel.dependencies.items.filter(d => (d.predecessorId === predecessorId && d.successorId === successorId) ||
            (d.successorId === predecessorId && d.predecessorId === successorId)).length)
            return false;

        const args = new DependencyInsertingArguments(predecessorId, successorId, type);
        this.modelManipulator.dispatcher.notifyDependencyInserting(args);
        if(args.cancel)
            return false;

        predecessorId = args.predecessorId;
        successorId = args.successorId;
        type = args.type;

        this.control.history.beginTransaction();
        this.history.addAndRedo(new InsertDependencyHistoryItem(this.modelManipulator, predecessorId, successorId, type));
        if(this.control.isValidateDependenciesRequired()) {
            const predecessorTask = this.control.viewModel.tasks.getItemById(predecessorId);
            if(type === DependencyType.SF || type === DependencyType.SS)
                this.control.validationController.moveStartDependTasks(predecessorId, predecessorTask.start);
            else
                this.control.validationController.moveEndDependTasks(predecessorId, predecessorTask.end);
        }
        this.control.history.endTransaction();
        return true;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowDependencyInsert;
    }
}
