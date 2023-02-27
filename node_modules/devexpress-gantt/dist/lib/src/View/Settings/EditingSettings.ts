import { isDefined } from "@devexpress/utils/lib/utils/common";

export class EditingSettings {
    enabled: boolean = false;
    allowDependencyDelete: boolean = true;
    allowDependencyInsert: boolean = true;
    allowTaskDelete: boolean = true;
    allowTaskInsert: boolean = true;
    allowTaskUpdate: boolean = true;
    allowResourceDelete: boolean = true;
    allowResourceInsert: boolean = true;
    allowResourceUpdate: boolean = true;
    allowTaskResourceUpdate: boolean = true;

    taskHoverDelay: number = 0;

    static parse(settings: any): EditingSettings {
        const result = new EditingSettings();
        if(settings) {
            if(isDefined(settings.enabled))
                result.enabled = settings.enabled;
            if(isDefined(settings.allowDependencyDelete))
                result.allowDependencyDelete = settings.allowDependencyDelete;
            if(isDefined(settings.allowDependencyInsert))
                result.allowDependencyInsert = settings.allowDependencyInsert;
            if(isDefined(settings.allowTaskDelete))
                result.allowTaskDelete = settings.allowTaskDelete;
            if(isDefined(settings.allowTaskInsert))
                result.allowTaskInsert = settings.allowTaskInsert;
            if(isDefined(settings.allowTaskUpdate))
                result.allowTaskUpdate = settings.allowTaskUpdate;
            if(isDefined(settings.allowResourceDelete))
                result.allowResourceDelete = settings.allowResourceDelete;
            if(isDefined(settings.allowResourceInsert))
                result.allowResourceInsert = settings.allowResourceInsert;
            if(isDefined(settings.allowResourceUpdate))
                result.allowResourceUpdate = settings.allowResourceUpdate;
            if(isDefined(settings.allowTaskResourceUpdate))
                result.allowTaskResourceUpdate = settings.allowTaskResourceUpdate;
            if(isDefined(settings.taskHoverDelay))
                result.taskHoverDelay = settings.taskHoverDelay;
        }
        return result;
    }
    equal(settings: EditingSettings): boolean {
        let result = true;
        result = result && this.enabled === settings.enabled;
        result = result && this.allowDependencyDelete === settings.allowDependencyDelete;
        result = result && this.allowDependencyInsert === settings.allowDependencyInsert;
        result = result && this.allowTaskDelete === settings.allowTaskDelete;
        result = result && this.allowTaskInsert === settings.allowTaskInsert;
        result = result && this.allowTaskUpdate === settings.allowTaskUpdate;
        result = result && this.allowResourceDelete === settings.allowResourceDelete;
        result = result && this.allowResourceInsert === settings.allowResourceInsert;
        result = result && this.allowResourceUpdate === settings.allowResourceUpdate;
        result = result && this.allowTaskResourceUpdate === settings.allowTaskResourceUpdate;
        return result;
    }
}
