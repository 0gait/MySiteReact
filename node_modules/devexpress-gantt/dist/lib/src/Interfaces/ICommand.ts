import { GanttView } from "../View/GanttView";

export interface ICommand {
    control: GanttView;
    getState(): ICommandState;
    execute(...parameters: any): boolean;
}

export interface ICommandState {
    enabled: boolean;
    visible: boolean;
    value: any;
}
