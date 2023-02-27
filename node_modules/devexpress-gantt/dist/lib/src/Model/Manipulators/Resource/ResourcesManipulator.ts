import { ModelChangesDispatcher } from "../../Dispatchers/ModelChangesDispatcher";
import { GanttDataObjectNames } from "../../Entities/DataObject";
import { Resource } from "../../Entities/Resource";
import { ResourceAssignment } from "../../Entities/ResourceAssignment";
import { ViewVisualModel } from "../../VisualModel/VisualModel";
import { BaseManipulator } from "../BaseManipulator";
import { ResourcePropertiesManipulator } from "./Properties/ResourcePropertiesManipulator";

export class ResourcesManipulator extends BaseManipulator {
    properties: ResourcePropertiesManipulator;

    constructor(viewModel: ViewVisualModel, dispatcher: ModelChangesDispatcher) {
        super(viewModel, dispatcher);
        this.properties = new ResourcePropertiesManipulator(viewModel, dispatcher);
    }
    create(text: string, color?: string, id?: string, callback?: (id: any) => void): Resource {
        const viewModel = this.viewModel;
        viewModel.onBeginDataObjectCreate();
        const resource = viewModel.resources.createItem();
        resource.text = text;
        if(color)
            resource.color = color;
        if(id)
            resource.internalId = id;
        resource.id = resource.internalId;
        this.viewModel.resources.add(resource);
        this.dispatcher.notifyResourceCreated(this.getResourceObjectForDataSource(resource), id => {
            const oldKey = resource.internalId;
            resource.updateId(id);
            viewModel.processServerInsertedKey(oldKey, resource.internalId, GanttDataObjectNames.resource);
            if(callback)
                callback(id);
        }, this.getErrorCallback());
        viewModel.onEndDataObjectCreate();
        return resource;
    }
    remove(resourceId: string): Resource {
        const resource = this.viewModel.resources.getItemById(resourceId);
        if(!resource)
            throw new Error("Invalid resource id");
        const assignments = this.viewModel.assignments.items.filter(a => a.resourceId === resourceId);
        if(assignments.length)
            throw new Error("Can't delete assigned resource");
        this.viewModel.resources.remove(resource);
        this.dispatcher.notifyResourceRemoved(resource.id, this.getErrorCallback(), this.viewModel.getResourceObjectForDataSource(resource));
        return resource;
    }
    assign(resourceID: string, taskId: string, id?: string): ResourceAssignment {
        const viewModel = this.viewModel;
        viewModel.onBeginDataObjectCreate();
        const assignment = viewModel.assignments.createItem();
        assignment.resourceId = resourceID;
        assignment.taskId = taskId;
        if(id)
            assignment.internalId = id;
        assignment.id = assignment.internalId;
        this.viewModel.assignments.add(assignment);
        this.dispatcher.notifyResourceAssigned(this.getResourceAssignmentObjectForDataSource(assignment), id => {
            const oldKey = assignment.internalId;
            assignment.updateId(id);
            viewModel.processServerInsertedKey(oldKey, assignment.internalId, GanttDataObjectNames.resourceAssignment);
        }, this.getErrorCallback());
        this.viewModel.updateModel();
        viewModel.onEndDataObjectCreate();
        this.viewModel.owner.resetAndUpdate();
        return assignment;
    }
    deassig(assignmentId: string): ResourceAssignment {
        const assignment = this.viewModel.assignments.getItemById(assignmentId);
        this.viewModel.assignments.remove(assignment);
        this.dispatcher.notifyResourceUnassigned(assignment.id, this.getErrorCallback(), this.viewModel.getResourceAssignmentObjectForDataSource(assignment));
        this.viewModel.updateModel();
        this.viewModel.owner.resetAndUpdate();
        return assignment;
    }
    private getResourceObjectForDataSource(resource: Resource) {
        return {
            id: resource.id,
            text: resource.text
        };
    }
    private getResourceAssignmentObjectForDataSource(resourceAssignment: ResourceAssignment) {
        return {
            id: resourceAssignment.id,
            taskId: this.viewModel.tasks.getItemById(resourceAssignment.taskId).id,
            resourceId: this.viewModel.resources.getItemById(resourceAssignment.resourceId).id
        };
    }
}
