import { isDefined } from "@devexpress/utils/lib/utils/common";
import { GanttDataObjectNames } from "../../Entities/DataObject";
import { ITaskUpdateValues } from "../../Entities/ITaskUpdateValues";
import { Task } from "../../Entities/Task";
import { BaseManipulator } from "../BaseManipulator";

export class TaskManipulator extends BaseManipulator {
    create(data: Record<string, any>, id?: string, callback?: () => void): Task {
        const viewModel = this.viewModel;
        viewModel.onBeginDataObjectCreate();
        const task = viewModel.tasks.createItem();
        task.start = data.start;
        task.end = data.end;
        task.title = data.title;
        task.progress = data.progress;
        if(data.color)
            task.color = data.color;
        const parentItem = viewModel.tasks.getItemById(data.parentId);
        if(parentItem)
            parentItem.expanded = true;
        task.parentId = data.parentId;
        if(id)
            task.internalId = id;
        task.id = task.internalId;
        viewModel.tasks.add(task);
        viewModel.updateModel();
        this.dispatcher.notifyTaskCreated(this.getObjectForDataSource(task), id => {
            const oldKey = task.internalId;
            task.updateId(id);
            viewModel.processServerInsertedKey(oldKey, task.internalId, GanttDataObjectNames.task);
            if(callback)
                callback();
            if(this.viewModel.requireFirstLoadParentAutoCalc) {
                const data = viewModel.getCurrentTaskData().map(t => {
                    if(t.parentId === "")
                        t.parentId = null;
                    return t;
                });
                this.dispatcher.notifyParentDataRecalculated(data);
            }
        }, this.getErrorCallback());
        viewModel.onEndDataObjectCreate();
        viewModel.owner.resetAndUpdate();
        return task;
    }
    remove(taskId: string): Task {
        const task = this.viewModel.tasks.getItemById(taskId);
        if(!task)
            throw new Error("Invalid task id");
        const dependencies = this.viewModel.dependencies.items.filter(d => d.predecessorId == taskId || d.successorId == taskId);
        if(dependencies.length)
            throw new Error("Can't delete task with dependency");
        const assignments = this.viewModel.assignments.items.filter(a => a.taskId == taskId);
        if(assignments.length)
            throw new Error("Can't delete task with assigned resource");
        this.viewModel.tasks.remove(task);
        this.dispatcher.notifyTaskRemoved(task.id, this.getErrorCallback(), this.viewModel.getTaskObjectForDataSource(task));
        this.viewModel.updateModel();
        this.viewModel.owner.resetAndUpdate();
        return task;
    }
    public update(taskId: string, newValues: ITaskUpdateValues) : ITaskUpdateValues {
        const task = this.viewModel.tasks.getItemById(taskId);
        const oldState = { };
        Object.keys(newValues).forEach(key => {
            if(isDefined(task[key])) {
                oldState[key] = task[key];
                task[key] = newValues[key];
            }
        });
        const viewItem = this.viewModel.findItem(taskId);
        if(viewItem)
            this.renderHelper.recreateTaskElement(viewItem.visibleIndex);
        this.dispatcher.notifyTaskUpdated(task.id, newValues, this.getErrorCallback());
        return oldState;

    }
    private getObjectForDataSource(task: Task) {
        return this.viewModel.getTaskObjectForDataSource(task);
    }
}
