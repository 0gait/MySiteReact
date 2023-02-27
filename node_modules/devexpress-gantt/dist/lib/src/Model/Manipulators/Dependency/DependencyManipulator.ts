import { GanttDataObjectNames } from "../../Entities/DataObject";
import { Dependency } from "../../Entities/Dependency";
import { DependencyType } from "../../Entities/Enums";
import { BaseManipulator } from "../BaseManipulator";

export class TaskDependencyManipulator extends BaseManipulator {
    insertDependency(predecessorId: string, successorId: string, type: DependencyType, id?: string): Dependency {
        const viewModel = this.viewModel;
        viewModel.onBeginDataObjectCreate();
        const dependency = viewModel.dependencies.createItem();
        dependency.predecessorId = predecessorId;
        dependency.successorId = successorId;
        dependency.type = type;
        if(id)
            dependency.internalId = id;
        dependency.id = dependency.internalId;
        viewModel.dependencies.add(dependency);
        const callback = (newKey) => {
            const oldKey = dependency.internalId;
            dependency.updateId(newKey);
            viewModel.processServerInsertedKey(oldKey, dependency.internalId, GanttDataObjectNames.dependency);
        };
        viewModel.updateVisibleItemDependencies();
        this.renderHelper.recreateConnectorLineElement(dependency.internalId, true);
        this.dispatcher.notifyDependencyInserted(this.getObjectForDataSource(dependency), callback, this.getErrorCallback());
        viewModel.onEndDataObjectCreate();
        return dependency;
    }
    removeDependency(dependencyId: string): Dependency {
        const dependency = this.viewModel.dependencies.getItemById(dependencyId);
        this.viewModel.dependencies.remove(dependency);
        this.dispatcher.notifyDependencyRemoved(dependency.id, this.getErrorCallback(), this.viewModel.getDependencyObjectForDataSource(dependency));
        this.viewModel.updateVisibleItemDependencies();
        this.renderHelper.recreateConnectorLineElement(dependency.internalId);
        return dependency;
    }
    private getObjectForDataSource(dependency: Dependency) {
        const predecessor = this.viewModel.tasks.getItemById(dependency.predecessorId);
        const successor = this.viewModel.tasks.getItemById(dependency.successorId);
        const dependencyObject = {
            id: dependency.id,
            predecessorId: predecessor.id,
            successorId: successor.id,
            type: dependency.type
        };

        return dependencyObject;
    }
}
