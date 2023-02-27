import GanttView from "..";
import { ConfirmationDialog } from "../Dialogs/ConfirmationDialog";
import { ConstraintViolationDialogCommand } from "../Dialogs/ConstraintViolationDialog";
import { ResourcesDialogCommand } from "../Dialogs/ResourcesDialog";
import { TaskEditDialogCommand } from "../Dialogs/TaskEditDialog";
import { ICommand } from "../Interfaces/ICommand";
import { GanttClientCommand } from "./ClientCommand";
import { CollapseAllCommand } from "./CollapseExpand/CollapseAllCommand";
import { ExpandAllCommand } from "./CollapseExpand/ExpandAllCommand";
import { CreateDependencyCommand } from "./Dependency/CreateDependencyCommand";
import { RemoveDependencyCommand } from "./Dependency/RemoveDependencyCommand";
import { ToggleDependenciesCommand } from "./Dependency/ToggleDependencies";
import { ToggleFullScreenCommand } from "./FullScreen/FullScreenCommand";
import { RedoCommand } from "./History/RedoCommand";
import { UndoCommand } from "./History/UndoCommand";
import { AssignResourceCommand } from "./Resource/AssignResourceCommand";
import { CreateResourceCommand } from "./Resource/CreateResourceCommand";
import { DeassignResourceCommand } from "./Resource/DeassignResourceCommand";
import { ResourceColorCommand } from "./Resource/Properties/ResourceColorCommand";
import { RemoveResourceCommand } from "./Resource/RemoveResourceCommand";
import { ToggleResourceCommand } from "./Resource/ToggleResource";
import { CreateSubTaskCommand } from "./Task/CreateSubTaskCommand";
import { CreateTaskCommand } from "./Task/CreateTaskCommand";
import { UpdateTaskCommand } from "./Task/UpdateTaskCommand";
import { RemoveTaskCommand } from "./Task/RemoveTaskCommand";
import { TaskAddContextItemCommand } from "./Task/TaskAddContextItemCommand";
import { ZoomInCommand } from "./Zoom/ZoomInCommand";
import { ZoomOutCommand } from "./Zoom/ZoomOutCommand";

export class CommandManager {
    control: GanttView;
    private commands: { [key: number]: ICommand };

    constructor(control: GanttView) {
        this.control = control;

        this.commands = {};
        this.createCommand(GanttClientCommand.CreateTask, this.createTaskCommand);
        this.createCommand(GanttClientCommand.CreateSubTask, this.createSubTaskCommand);
        this.createCommand(GanttClientCommand.RemoveTask, this.removeTaskCommand);
        this.createCommand(GanttClientCommand.RemoveDependency, this.removeDependencyCommand);
        this.createCommand(GanttClientCommand.TaskInformation, this.showTaskEditDialog);
        this.createCommand(GanttClientCommand.ResourceManager, this.showResourcesDialog);
        this.createCommand(GanttClientCommand.TaskAddContextItem, new TaskAddContextItemCommand(this.control));
        this.createCommand(GanttClientCommand.Undo, new UndoCommand(this.control));
        this.createCommand(GanttClientCommand.Redo, new RedoCommand(this.control));
        this.createCommand(GanttClientCommand.ZoomIn, new ZoomInCommand(this.control));
        this.createCommand(GanttClientCommand.ZoomOut, new ZoomOutCommand(this.control));
        this.createCommand(GanttClientCommand.FullScreen, new ToggleFullScreenCommand(this.control));
        this.createCommand(GanttClientCommand.CollapseAll, new CollapseAllCommand(this.control));
        this.createCommand(GanttClientCommand.ExpandAll, new ExpandAllCommand(this.control));
        this.createCommand(GanttClientCommand.ToggleResources, this.toggleResources);
        this.createCommand(GanttClientCommand.ToggleDependencies, this.toggleDependencies);

    }
    get createTaskCommand(): CreateTaskCommand { return new CreateTaskCommand(this.control); }
    get createSubTaskCommand(): CreateSubTaskCommand { return new CreateSubTaskCommand(this.control); }
    get removeTaskCommand(): RemoveTaskCommand { return new RemoveTaskCommand(this.control); }
    get updateTaskCommand(): UpdateTaskCommand { return new UpdateTaskCommand(this.control); }

    get createDependencyCommand(): CreateDependencyCommand { return new CreateDependencyCommand(this.control); }
    get removeDependencyCommand(): RemoveDependencyCommand { return new RemoveDependencyCommand(this.control); }

    get createResourceCommand(): CreateResourceCommand { return new CreateResourceCommand(this.control); }
    get removeResourceCommand(): RemoveResourceCommand { return new RemoveResourceCommand(this.control); }
    get assignResourceCommand(): AssignResourceCommand { return new AssignResourceCommand(this.control); }
    get deassignResourceCommand(): DeassignResourceCommand { return new DeassignResourceCommand(this.control); }
    get changeResourceColorCommand(): ResourceColorCommand { return new ResourceColorCommand(this.control); }

    get showTaskEditDialog(): TaskEditDialogCommand { return new TaskEditDialogCommand(this.control); }
    get showConstraintViolationDialog() : ConstraintViolationDialogCommand { return new ConstraintViolationDialogCommand(this.control); }
    get showConfirmationDialog() : ConfirmationDialog { return new ConfirmationDialog(this.control); }
    get showResourcesDialog(): ResourcesDialogCommand { return new ResourcesDialogCommand(this.control); }

    get toggleResources(): ToggleResourceCommand { return new ToggleResourceCommand(this.control); }
    get toggleDependencies(): ToggleDependenciesCommand { return new ToggleDependenciesCommand(this.control); }

    public getCommand(key: GanttClientCommand): ICommand {
        return this.commands[key];
    }
    protected createCommand(commandId: GanttClientCommand, command: ICommand): void {
        this.commands[commandId] = command;
    }
}
