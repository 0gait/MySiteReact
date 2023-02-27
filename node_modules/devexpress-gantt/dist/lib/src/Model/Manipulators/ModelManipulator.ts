import { ModelChangesDispatcher } from "../Dispatchers/ModelChangesDispatcher";
import { ViewVisualModel } from "../VisualModel/VisualModel";
import { TaskDependencyManipulator } from "./Dependency/DependencyManipulator";
import { ResourcesManipulator } from "./Resource/ResourcesManipulator";
import { TaskManipulator } from "./Task/TaskManipulator";

export class ModelManipulator {
    task: TaskManipulator;
    dependency: TaskDependencyManipulator;
    resource: ResourcesManipulator;

    dispatcher: ModelChangesDispatcher;

    constructor(viewModel: ViewVisualModel, dispatcher: ModelChangesDispatcher) {
        this.task = new TaskManipulator(viewModel, dispatcher);
        this.dependency = new TaskDependencyManipulator(viewModel, dispatcher);
        this.resource = new ResourcesManipulator(viewModel, dispatcher);

        this.dispatcher = dispatcher;
    }
}
