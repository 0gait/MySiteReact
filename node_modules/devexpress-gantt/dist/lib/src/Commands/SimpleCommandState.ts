import { ICommandState } from "../Interfaces/ICommand";

export class SimpleCommandState implements ICommandState {
    enabled: boolean;
    visible: boolean = true;
    value: any;
    constructor(enabled: boolean, value?: any) {
        this.enabled = enabled;
        this.value = value;
    }
}
