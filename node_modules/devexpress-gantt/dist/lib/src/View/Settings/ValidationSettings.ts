import { isDefined } from "@devexpress/utils/lib/utils/common";

export class ValidationSettings {
    validateDependencies: boolean = false;
    autoUpdateParentTasks: boolean = false;
    enablePredecessorGap: boolean = false;


    static parse(settings: any): ValidationSettings {
        const result = new ValidationSettings();
        if(settings) {
            if(isDefined(settings.validateDependencies))
                result.validateDependencies = settings.validateDependencies;
            if(isDefined(settings.autoUpdateParentTasks))
                result.autoUpdateParentTasks = settings.autoUpdateParentTasks;
            if(isDefined(settings.enablePredecessorGap))
                result.enablePredecessorGap = settings.enablePredecessorGap;
        }
        return result;
    }
    equal(settings: ValidationSettings): boolean {
        let result = true;
        result = result && this.validateDependencies === settings.validateDependencies;
        result = result && this.autoUpdateParentTasks === settings.autoUpdateParentTasks;
        result = result && this.enablePredecessorGap === settings.enablePredecessorGap;

        return result;
    }
}
