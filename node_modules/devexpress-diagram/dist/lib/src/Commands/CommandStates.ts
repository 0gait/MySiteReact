import { ICommandState } from "./ICommand";

export class SimpleCommandState implements ICommandState {
    enabled: boolean;
    value: any;
    defaultValue: any;
    visible: boolean = true;
    denyUpdateValue: boolean = false;
    items: any[];

    constructor(enabled: boolean, value: any, defaultValue: any, items: any[], visible: boolean) {
        this.enabled = enabled;
        this.value = value;
        this.items = items;
        this.visible = visible;
        this.defaultValue = defaultValue;
    }
}
