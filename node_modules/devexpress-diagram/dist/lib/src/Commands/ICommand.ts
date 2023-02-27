import { DiagramControl } from "../Diagram";

export interface ICommand {
    control: DiagramControl;
    getState(): ICommandState;
    execute(parameter?: any): boolean;
}

export interface ICommandState {
    enabled: boolean;
    value: any;
    defaultValue: any;
    visible: boolean;
    denyUpdateValue: boolean;
    items: any[];
}
